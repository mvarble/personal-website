"""
This file will generate data for us to visualize in javascript.
The data it produces are (bias) samples of a jump diffusion of the form

dXₜ = b(Xₜ)dt + σ(Xₜ)dWₜ + dNₜ

where W is a Brownian motion and N is an indepenednet compound Poisson process.
"""
import numpy as np
from numpy.random import default_rng
import pandas as pd

"""
This is where we declare our samplers; take note of the referentially opaque 
`rng` variable, which is updated below
"""
class JumpDiffusion:
    def __init__(self, XDict):
        self.x0 = XDict['x0']
        self.b = XDict['b']
        self.sigma = XDict['sigma']
        self.intensity = XDict['intensity']
        self.jump = XDict['jump']

    def sample_time_jumps(self, T):
        """We can sample the jump times exactly, with the provided sampler for 
        the jump distribution"""
        # sample the times
        lam = self.intensity
        arrive = lambda: rng.exponential(1.0 / lam) if lam > 0 else np.inf
        total = arrive()
        ts = [total]
        while total <= T:
            total += arrive()
            ts += [total]

        # stack with jumps
        return { 'times': np.array(ts[:-1]), 'jumps': self.jump(len(ts) - 1) }

    def time_jumps_trajectory(self, time_jumps, T, N):
        """we can map the jump times to a discretized trajectory"""
        # alias the time step
        dt = T / (N - 1)

        # parse the jumps
        jump_times = time_jumps['times']
        jump_vals = time_jumps['jumps']

        # parse the shape
        m, d = jump_vals.shape

        # if there are no jumps, return 0 trajectory
        trajectory = np.zeros((N, d))
        if (m == 0):
            return trajectory

        # otherwise build the trajectory from these jumps
        val = np.zeros((1, d))
        jump_index = 0
        for k in range(N):
            t = k * dt
            while jump_index < len(jump_times) and t >= jump_times[jump_index]:
                val += jump_vals[jump_index]
                jump_index += 1
            trajectory[k, :] = val

        # return an array of the trajectory and where the jumps happened
        return trajectory
    
    def sample_continuous(self, T, N):
        """we can (bias) sample the continuous component with an Euler scheme"""
        # initialize arrays and alias the timestep and diffusion data
        d = self.x0.size
        xs = np.zeros((N, d))
        ws = np.zeros((N, d))
        dt = T / (N - 1)

        # build the array of samples
        xs[0, :] = self.x0
        for j in range(1, N):
            dw = rng.normal(0, np.sqrt(dt), (1, d))
            xs[j,:] = (
                    xs[j-1,:] 
                    + self.b(xs[j-1,:]) * dt 
                    + dw @ self.sigma(xs[j-1,:])
                    )
            ws[j, :] = ws[j-1, :] + dw

        # return the array
        return { 'X': xs, 'W': ws }

    def sample(self, T, N):
        """combine the samplers to create a (bias) sample of the path"""
        # parse the dimension
        d = self.x0.size

        # sample the continuous path
        continuous = self.sample_continuous(T, N)

        # sample the jump path
        time_jumps = self.sample_time_jumps(T)
        xs_d = self.time_jumps_trajectory(time_jumps, T, N)

        # get the jump differences
        jumps = np.diff(xs_d, axis=0)

        # return the trajectory and other info
        return { 
                'X': continuous['X'] + xs_d, 
                'W': continuous['W'],
                'jumps': np.vstack((np.zeros((1, d)), jumps))
                }

"""
Data generation
"""

# initialize the data we eventually output
rows = []


"""
Slide 1: Some arbitrary CIR process
"""

# seed the generator so that we control the randomness
rng = default_rng(420)

# our jump diffusion will be determined by a dictionary, like so
a = 0.5
b = 3.0
sigma = 0.25
x0 = np.array([[5.0]])
X = JumpDiffusion({ 
    'x0': x0,
    'b': lambda x: a * (b - x), 
    'sigma': lambda x: sigma * np.sqrt(np.abs(x)),
    'intensity': 0.25,
    'jump': lambda n: rng.normal(0, 1, (n, 1)),
    })

# create the times
T = 5
N = 501
ts = np.arange(N) * T / (N - 1)

# build the data
for j in range(10):
    # sample the path
    d = X.sample(T, N)
    xs = d['X']
    jumps = d['jumps']

    # build the rows
    rows += [{ 
        'slide': 1,
        't': ts[k], 
        'Xt': xs[k,0], 
        'jump': jumps[k,0], 
        'sample': j,
        'x0': x0[0],
        'a': a,
        'b': b,
        'sigma': sigma,
        } for k in range(N)]

"""
Slide 2: create a bunch of different diffusions and sample a pass/fail
"""

# these will be used as seeds for our samples
seeds = [393, 111, 4]

# create the diffusions
X1 = JumpDiffusion({ 
    'x0': np.array([[0]]),
    'b': lambda x: 3 * (2 - x),
    'sigma': lambda x: 2.4 * np.sqrt(np.abs(x)),
    'intensity': 0.3,
    'jump': lambda n: rng.normal(0, 4, (n, 1)),
    })
X2 = JumpDiffusion({ 
    'x0': np.array([[0]]),
    'b': lambda x: 0.35 * (8 - x),
    'sigma': lambda x: 0.35 * np.sqrt(np.abs(x)),
    'intensity': 0.25,
    'jump': lambda n: rng.normal(0, 1, (n, 1)),
    })
X3 = JumpDiffusion({ 
    'x0': np.array([[7]]),
    'b': lambda x: 0.5 * (2 - x),
    'sigma': lambda x: 0.35 * np.sqrt(np.abs(x)),
    'intensity': 0.5,
    'jump': lambda n: rng.normal(0, 1, (n, 1)),
    })

diffusions = [X1, X2, X3]

# these are labels for which samples belong to which chart
types = ['bound', 'ball', 'marginal']

# create the times
T = 5
N = 501
ts = np.arange(N) * T / (N - 1)

# build the data
for j in range(2):
    for (seed, diffusion, name) in zip(seeds, diffusions, types):
        # seed a Generator
        rng = default_rng(seed * (j + 1))

        # sample the path
        d = diffusion.sample(T, N)
        xs = d['X']
        jumps = d['jumps']

        # build the rows
        rows += [{
            'slide': 2,
            't': ts[k],
            'Xt': xs[k,0],
            'jump': jumps[k,0],
            'sample': j,
            'type': name,
        } for k in range(N)]

"""
Slide 3
"""

# Brownian motion
T = 5
N = 5000
W = JumpDiffusion({ 
    'x0': np.zeros((1, 2)), 
    'b': lambda x: np.zeros((1, 2)),
    'sigma': lambda x: np.eye(2),
    'intensity': 0.0,
    'jump': lambda n: np.zeros((1, 2)),
})
rng = default_rng(18)
rows += [{ 
    'slide': 3, 
    'name': 'brownian',  
    'T': T,
    'points': W.sample(T, N)['X']
    }]

# OU
X = JumpDiffusion({ 
    'x0': np.zeros((1, 2)), 
    'b': lambda x: (np.array([[3, -2]]) - x) @ np.array([[2, 0], [0, 3]]),
    'sigma': lambda x: 0.5 * np.array([[3, 0], [0, 1]]),
    'intensity': 0.0,
    'jump': lambda n: np.zeros((1, 2)),
})
rows += [{ 
    'slide': 3, 
    'name': 'ou',  
    'T': T,
    'points': X.sample(T, N)['X']
    }]

# CIR
X = JumpDiffusion({ 
    'x0': np.array([3]), 
    'b': lambda x: 5 * (3 - x),
    'sigma': lambda x: 0.5 * np.sqrt(np.abs(x)),
    'intensity': 0.0,
    'jump': lambda n: np.zeros((n, 1)),
})
rows += [{
    'slide': 3,
    'name': 'cir',
    'T': T,
    'points': X.sample(T, N)['X']
    }]

# Poisson
X = JumpDiffusion({ 
    'x0': np.array([0]), 
    'b': lambda x: np.array([[0]]),
    'sigma': lambda x: np.array([[0]]),
    'intensity': 1.0,
    'jump': lambda n: np.ones((n, 1)),
})
rows += [{
    'slide': 3,
    'name': 'poisson',
    'T': T,
    'points': X.sample(T, N)['X']
    }]

# Levy
X = JumpDiffusion({ 
    'x0': np.array([0, 0]), 
    'b': lambda x: np.array([[1, -3]]),
    'sigma': lambda x: np.array([[0.8, 0], [0, 1.2]]),
    'intensity': 3.0,
    'jump': lambda n: (
        np.array([[1, 2]]) 
        + rng.normal(0, 1, (n, 2)) @ np.array([[5, -1], [-1, 10]])
        )
})
rows += [{
    'slide': 3,
    'name': 'levy',
    'T': T,
    'points': X.sample(T, N)['X']
    }]

# Branching with immigration
rng = default_rng(2123)
x = 0.7
sigma = 1.0
arrival = lambda n: rng.exponential(1.0 / (x + n * sigma))
total = arrival(0)
times = [total]
k = 1
while total <= T:
    t = arrival(k)
    total += t
    times += [total]
    k += 1
times = np.array(times[:-1])
jumps = np.ones((times.size, 1))
rows += [{
    'slide': 3,
    'name': 'branching',
    'T': T,
    'points': X.time_jumps_trajectory({ 'times': times, 'jumps': jumps }, T, 1000),
    }]

# Hawkes
from scipy.optimize import broyden1 

x = 10.0
a = 3.0
b = 0.8

def compensator(times, jumps):
    tau_k = times[-1] if len(times) else 0
    time_jumps = zip(times, jumps)
    def f(t):
        return (
            a * (t  - tau_k)
            - (x-a) * (np.exp(-b * t) - np.exp(-b * tau_k)) / b
            - sum([
                y * (np.exp(-b * (t - tau)) - np.exp(-b * (tau_k - tau)))
                for (tau, y) in time_jumps
            ]) / b
        )
    return f

def arrival():
    f = compensator(times, jumps)
    S = rng.exponential(1)
    tau_k = times[-1] if len(times) else 0
    return broyden1(lambda t: f(t) - S, tau_k + 10)

jump = lambda: rng.lognormal(0.5, 0.2)

times = []
jumps = []
total = arrival()
times = np.array([total])
jumps = np.array([jump()])
while total <= T:
    total = arrival()
    times = np.append(times, total)
    jumps = np.append(jumps, jump())
rows += [{
    'slide': 3,
    'name': 'hawkes',
    'T': T,
    'jumps': jumps[:-1],
    'times': times[:-1],
    'a': a,
    'b': b,
    'x0': x,
    }]

"""
Slide 4: Monte Carlo / importance sampling
"""
rng = default_rng(102981)
x0 = np.array([[0.5]])
a = 0.5
b = 0.01
sigma = 0.25
X = JumpDiffusion({ 
    'x0': x0,
    'b': lambda x: a * (b - x), 
    'sigma': lambda x: sigma * np.sqrt(np.abs(x)),
    'intensity': 0,
    'jump': lambda n: np.zeros((n, 1)),
    })
Y = JumpDiffusion({
    'x0': x0,
    'b': lambda x: (a * 1.5) * (b * 200 - x),
    'sigma': lambda x: sigma * np.sqrt(np.abs(x)),
    'intensity': 0,
    'jump': lambda n: np.zeros((n, 1)),
    })

# build the data
for j in range(10):
    # sample the path
    N = 500
    xs = np.cumsum(np.abs(X.sample(T, N)['X'].T[0])) * T / (N - 1)
    ys = np.cumsum(np.abs(Y.sample(T, N)['X'].T[0])) * T / (N - 1)

    # build the rows
    rows += [{ 
        'slide': 4,
        'version': 'P',
        'sample': j,
        'T': T,
        'points': xs, 
        }]
    rows += [{
        'slide': 4,
        'version': 'Q',
        'sample': j,
        'T': T,
        'points': ys
        }]

"""
Slide 05: asymptotic regime
"""
x0 = np.array([[0]])
a = 2
b = 3
sigma = 1.0
alpha = 2.0
diffusion = lambda x: np.sqrt(np.abs(alpha + sigma * x))
X = JumpDiffusion({ 
    'x0': x0,
    'b': lambda x: a * (b - x), 
    'sigma': diffusion,
    'intensity': 0,
    'jump': lambda n: np.zeros((n, 1)),
    })

# build the data
M = 25
seed = 2123098
for j in range(M):
    rng = default_rng(seed)
    for k in range(10):
        # create epsilon
        epsilon = 0.25 * (1 - j / (M - 1))**3

        # sample the path
        N = 500
        X.sigma = lambda x: np.sqrt(epsilon) * diffusion(x)
        xs = X.sample(T, N)['X'].T[0]

        # build the rows
        rows += [{ 
            'slide': 5,
            'epsilon': j,
            'sample': k,
            'T': T,
            'points': xs, 
            }]

"""
Export JSON
"""
pd.DataFrame(data=rows).to_json('data.json', 'records')
