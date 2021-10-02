import React from 'react';
import ReactDOM from 'react-dom';
import { isNode } from '@firebase/util';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { 
  modal, 
  isOpen, 
  isClosed, 
  modalGap,
  modalBox, 
  modalHeader, 
  modalBody,
  button,
  commentBody,
  commentText,
  commentChildren,
  withChildren,
} from './index.module.scss';
import useDiscussions from './use-discussions';
import TeX from '../tex';
import Markdown from '../markdown';

export default function Discussion({ slug }) {
  // subscribe to firebase realtime-database
  const { comments, postComment } = useDiscussions(slug);

  // create a state for the modal 
  const [open, setOpen] = React.useState(true);

  // create a listener for closing open modals on keypress
  React.useEffect(() => {
    if (!open) return;
    const keyboard = e => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, [open, setOpen]);

  // create a state for if we are replying
  const [reply, setReply] = React.useState(null);

  // create a state for if we are commenting to begin with
  const [commenting, setCommenting] = React.useState(false);

  // create callbacks for commenting
  const setReplier = React.useCallback(comment => (() => {
    setCommenting(true);
    setReply(comment);
    setOpen(true);
  }), [setCommenting, setReply, setOpen]);
  const setNew = React.useCallback(() => {
    setCommenting(true); 
    setOpen(true); 
    setReply(null); 
  }, [setCommenting, setOpen, setReply]);

  // render 
  return (
    <div className="section">
      <h1>Discussion</h1>
      <div>
        { 
          comments.map(comment => (
            <Comment 
              key={ comment.key } 
              id={ comment.key } 
              comment={ comment } 
              level={ 0 } 
              setReplier={ setReplier } />
          )) 
        }
        <div>
          <button 
            onClick={ setNew }
            style={{ display: 'block', margin: '1em auto' }} 
            className="button is-primary">
            New Comment
          </button>
        </div>
      </div>
      <CommentModal 
        commenting={ commenting }
        setCommenting={ setCommenting }
        setReply={ setReply }
        reply={ reply }
        postComment={ postComment } 
        open={ open } 
        setOpen={ setOpen } />
    </div>
  );
}

function Comment({ comment, level, setReplier }) {
  // parse the comment
  const { timestamp, key, body, children } = comment;

  // create a datestring for the post
  const dateString = React.useMemo(() => {
    const date = new Date(timestamp);
    const year = date.getUTCFullYear();
    const month = date.getMonth() + 1;
    const day = date.getUTCDate();
    return (
      String(year).padStart(4, '0')
      + '-' + String(month).padStart(2, '0') 
      + '-' + String(day).padStart(2, '0')
    );
  }, [timestamp]);

  // variable for if the comment has children
  const hasChildren = Array.isArray(children) && children.length

  // render
  return (
    <div>
      <div className={ `${commentBody} ${hasChildren ? withChildren : ''}` }>
        <span>{ dateString }</span>
        <div className={ commentText }>
          <div><TeX><Markdown>{ body }</Markdown></TeX></div>
          <div>
            <a href={ '#' + key } onClick={ setReplier(comment) }>reply</a>
          </div>
        </div>
      </div>
      { 
        hasChildren
        ? (
          <div className={ commentChildren }>
            { children.map(comment => (
                <Comment 
                  key={ comment.key }
                  comment={ comment } 
                  level={ level + 1 } 
                  setReplier={ setReplier } />
              ))
            }
          </div>
        )
        : null
      }
    </div>
  );
}

function CommentModal({ commenting, ...props }) {
  return (
    isNode() || !commenting
    ? null 
    : ReactDOM.createPortal(
      <NewComment { ...props } />, 
      document.getElementById('portal'),
    )
  );
}

function NewComment({ 
  postComment, 
  open, 
  setOpen,
  setCommenting,
  reply,
  setReply,
}) {
  return (
    <Modal open={ open } setOpen={ setOpen }>
      <ModalHeader open={ open } setOpen={ setOpen } />
      <NewCommentForm 
        reply={ reply }
        setReply={ setReply }
        postComment={ postComment } 
        setCommenting={ setCommenting }/>
    </Modal>
  );
}

function Modal({ open, setOpen, children }) {
  // create a callback for closing on clicks
  const ref = React.useRef();
  React.useEffect(() => {
    if (!ref.current || !open) return;
    const listener = e => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const portal = document.getElementById('portal');
    portal.addEventListener('click', listener);
    return () => portal.removeEventListener('click', listener);
  }, [ref, open, setOpen]);

  // render
  return (
    <div className={ `${modal} ${ open ? isOpen : isClosed }` }>
      <div className="columns">
        <div className="column is-two-thirds-widescreen is-full-desktop">
          <div className={ modalGap } />
          <div className={ modalBox } ref={ ref }>
            <div>
              { children }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalHeader({ open, setOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div className={ modalHeader }>
      <span>New Comment</span>
      <span 
        className={ `icon ${button} ${open ? isOpen : ''}` } 
        onClick={ () => setOpen(o => !o) } >
        <i className="fas fa-chevron-up" />
      </span>
    </div>
  );
}

function NewCommentForm({ postComment, setCommenting, reply, setReply }) {
  // create a state for the form body
  const [body, setBody] = React.useState('');

  // create a callback for submitting the form
  const submit = React.useCallback(() => {
    if (!body) return;
    postComment({ body, repliedTo: reply ? reply.key : null });
    setCommenting(false);
    setReply(null);
  }, [body, reply, postComment, setCommenting, setReply]);

  // create an rxjs stream which debounces the raw body text and subscribe a
  // rendering observer
  const ref = React.useRef();
  const [rendered, setRendered] = React.useState(null);
  React.useEffect(() => {
    if (!ref || !ref.current) return;
    const keys$ = fromEvent(ref.current, 'keydown').pipe(debounceTime(500));
    const subscription = keys$.subscribe(e => {
      const raw = e.target.value;
      setRendered(raw);
    });
    return () => subscription.unsubscribe();
  }, [ref, setRendered]);
  
  // render
  return (
    <div className={ modalBody }>
      { 
        reply
        ? (
          <div className="field" style={{ flex: '0 0 50px' }}>
            <label className="label">replying to:</label>
            <div className="control">
              <div style={{ paddingLeft: '1em' }}>{ reply.body }</div>
            </div>
          </div>
        )
        : null
      }
      <div 
        className="field" 
        style={{ 
          flex: '1 1 0', 
          display: 'flex', 
          flexDirection: 'column',
        }}>
        <label className="label" style={{ flexGrow: 0 }}>raw body:</label>
        <div className="control" style={{ flexGrow: 1 }}>
          <textarea 
            ref={ ref }
            className="textarea" 
            style={{ height: '100%', resize: 'none' }}
            value={ body } 
            onChange={ e => setBody(e.target.value) } />
        </div>
      </div>
      <div 
        className="field" 
        style={{ 
          flex: '1 1 0',
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        <label className="label" style={{ flexGrow: 0 }}>rendered:</label>
        <div className="control" style={{ flexGrow: 1, overflow: 'hidden' }}>
          <div 
            style={{ 
              background: 'white', 
              border: '1px solid var(--grey-lightest)',
              borderRadius: '4px',
              height: '100%',
              overflowY: 'auto',
            }}>
            <div style={{ padding: 'calc(0.75em - 1px)' }}>
              <TeX><Markdown>{ rendered }</Markdown></TeX>
            </div>
          </div>
        </div>
      </div>
      <div className="field is-grouped" 
        style={{ 
          borderTop: '1px solid var(--grey)', 
          paddingTop: '1em',
          flex: '0 0 50px',
        }}>
        <div className="control">
          <button
            className="button is-success" 
            onClick={ submit }
            disabled={ !body }>
            Submit
          </button>
        </div>
        <div className="control">
          <button
            className="button is-danger" 
            onClick={ () => setCommenting(false) }>
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
