import Random: randn
import JSON: json

# CIR process with parameters (a, b, σ, X_0) = (1.2, 3.1, 0.5, 2.2)
a = 1.2
b = 3.1
sigma = 0.5
x0 = 2.2

# generate samples
T = 10.0
times = LinRange(0.0, T, 2501)
count = 100
trajectories = zeros(length(times), count)
normals = randn(length(times)-1, count)
for i in 1:count
  trajectories[1,i] = x0
  for k in 2:length(times)
    dt = times[k] - times[k-1]
    dw = normals[k-1, i] * sqrt(dt)
    x = trajectories[k-1,i]
    trajectories[k,i] = x + a * (b - x) * dt + sigma * sqrt(abs(x)) * dw
  end
end

# export to json
write(
  "data.json",
  json(Dict(
    :a => a, 
    :b => b, 
    :sigma => sigma, 
    :samples => map(
      i -> map(
        ((x, t), ) -> Dict(:xt => x, :t => t, :sample => i), 
        zip(trajectories[:,i], times)
      ),
      1:count
    )
  ))
)
