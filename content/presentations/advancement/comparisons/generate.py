from math import sqrt, log, exp
import pandas as pd
from scipy.special import gammaincc, erf

# Standard Normal CDF
Phi = lambda x: 0.5 * (1 + erf(x / sqrt(2)))

# The approximations of P(S_hat_n > delta) for S_hat_n the 
# empirical mean where X_1, ..., X_n ~ Exp(1) independent.
actual = lambda n, delta: gammaincc(n, delta * n)
clt = lambda n, delta: 1 - Phi((delta - 1) * sqrt(n))
ldp = lambda n, delta: exp(-n * (delta - 1 - log(delta)))

# create pandas dataframe for values
ns = [10 + j for j in range(40)]
ds = [round(1.0 + 0.1 * j, 2) for j in range(40)]
actuals = [[n, delta, actual(n, delta), "Actual"] for n in ns for delta in ds]
clts = [[n, delta, clt(n, delta), "CLT"] for n in ns for delta in ds]
ldps = [[n, delta, ldp(n, delta), "LDP"] for n in ns for delta in ds]

pd.DataFrame(
    [*actuals, *clts, *ldps],
    columns=['n', 'delta', 'val', 'type']
).to_json('data.json', 'records')
