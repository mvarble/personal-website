use std::fmt::Debug;
use std::fs::File;
use std::io::{Error, Write};
use std::path::Path;
use std::sync::{Arc, Mutex};
use std::time::{Duration, SystemTime};
use tokio::sync::mpsc;

/// Simple trait which encodes some blocking calculation for grabbing values.
pub trait BlockingGrabber {
    type Payload;
    type Marker;
    fn init(&mut self) -> Option<Self::Marker>;
    fn next(&mut self, p: &Self::Payload) -> Option<Self::Marker>;
    fn grab(&mut self, m: &Self::Marker) -> Option<Self::Payload>;
}

/// Simple trait which encodes the syncing
pub trait Syncer {
    fn sync<S: Into<String>>(&mut self, message: S);
}

/// This struct implements our queue manager
struct QueueManager<P, G: BlockingGrabber<Payload = P>, S: Syncer> {
    receiver: mpsc::Receiver<P>,
    grabber: G,
    syncer: S,
}

impl<G, P, M, S> QueueManager<P, G, S>
where
    P: Debug + Clone + Send + 'static,
    M: Clone + Send + 'static,
    G: BlockingGrabber<Payload = P, Marker = M> + Clone + Send + 'static,
    S: Syncer + Clone + Send + 'static,
{
    pub fn new(grabber: G, syncer: S) -> Self {
        // create a channel for the payload
        let (tx, rx) = mpsc::channel(1);

        // clone the grabber and syncer
        let mut gbr = grabber.clone();
        let mut sncr = syncer.clone();

        // mount the lifecycle of the Sender
        tokio::task::spawn(async move {
            let mut opt_marker = gbr.init();
            loop {
                if let Some(marker) = opt_marker {
                    let opt_payload = gbr.grab(&marker);
                    match opt_payload {
                        Some(payload) => {
                            opt_marker = gbr.next(&payload);
                            let pld = payload.clone();
                            /* highlight-range{1-3} */
                            if let Err(_) = tx.send(pld).await {
                                sncr.sync("SEND ERROR");
                                return;
                            }
                            let message = format!("QUEUE {:?}", payload);
                            sncr.sync(&message);
                        }
                        None => {
                            return;
                        }
                    }
                } else {
                    return;
                }
            }
        });

        // return the manager
        Self {
            receiver: rx,
            grabber,
            syncer,
        }
    }

    async fn recv(&mut self) -> Option<P> {
        self.receiver.recv().await.map(|payload| {
            let message = format!("DEQUEUE {:?}", payload);
            self.syncer.sync(&message);
            payload
        })
    }
}

/// Our simple implementation of the [`SimpleGrabber`] trait.
#[derive(Clone)]
pub struct SimpleGrabber<S: Syncer> {
    syncer: S,
}

const VALS: &'static [i32] = &[1, 2, 3, 4, 5];
const LEN: usize = VALS.len();
const BLOCKS: &'static [u64] = &[125, 107, 60, 50, 300];
const SERVES: &'static [u64] = &[75, 205, 50, 140, 40];

impl<S: Syncer> SimpleGrabber<S> {
    fn new(syncer: S) -> Self {
        Self { syncer }
    }
}

impl<S: Syncer> BlockingGrabber for SimpleGrabber<S> {
    type Payload = i32;
    type Marker = usize;

    fn init(&mut self) -> Option<usize> {
        Some(0)
    }

    fn next(&mut self, p: &i32) -> Option<usize> {
        let u = *p as usize;
        if u >= LEN {
            None
        } else {
            Some(u)
        }
    }

    fn grab(&mut self, m: &usize) -> Option<i32> {
        if *m >= LEN {
            None
        } else {
            let val = VALS[*m];
            let message = format!("GRAB {:?}", val);
            std::thread::sleep(Duration::from_millis(BLOCKS[*m] as u64));
            self.syncer.sync(&message);
            Some(val)
        }
    }
}

/// Implementation of Syncer which writes messages to files.
#[derive(Clone)]
struct SyncWriter {
    start_time: SystemTime,
    writer: Arc<Mutex<File>>,
}

impl SyncWriter {
    fn new<P: AsRef<Path>>(path: P) -> Result<Self, Error> {
        let writer = File::create::<P>(path.into())?;
        Ok(Self {
            start_time: SystemTime::now(),
            writer: Arc::new(Mutex::new(writer)),
        })
    }
}

impl Syncer for SyncWriter {
    fn sync<S: Into<String>>(&mut self, message: S) {
        let elapsed = self.start_time.elapsed().unwrap().as_millis();
        let message = format!("{}:{:?}\n", message.into(), elapsed * 10);
        self.writer
            .lock()
            .unwrap()
            .write(message.as_bytes())
            .unwrap();
    }
}

#[tokio::main]
async fn main() {
    assert_eq!(BLOCKS.len(), LEN);
    assert_eq!(SERVES.len(), LEN);
    let mut syncer = SyncWriter::new("log.txt").unwrap();
    let grabber = SimpleGrabber::new(syncer.clone());
    let mut manager = QueueManager::new(grabber, syncer.clone());
    for delay in SERVES {
        if let Some(payload) = manager.recv().await {
            tokio::time::sleep(Duration::from_millis(*delay)).await;
            syncer.sync(format!("EAT {:?}", payload));
        } else {
            syncer.sync("TAKE ERROR");
            return;
        }
    }
}
