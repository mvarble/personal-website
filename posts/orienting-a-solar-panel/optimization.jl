import LinearAlgebra: norm, dot
import QuadGK: quadgk
import Optim: optimize, GradientDescent, Options

# constants
DISTANCE = 1.496e8
RADIUS = 6371
DAYS = 364.24
ALPHA = 23.45 * pi / 180

# timecycle
ω_d(t) = 2 * pi * t
ω_y(t) = ω_d(t) / DAYS

# spherical map coordinate transformation
σ(ϕ) = pi * (ϕ - 90) / 180
η(θ) = pi * (180 - θ) / 180

# frame transformations
T_y(t) = [
  1 0 0 DISTANCE * cos(ω_y(t)) ;
  0 1 0 0;
  0 0 1 -DISTANCE * sin(ω_y(t))
  0 0 0 1
]

T_a = [
  cos(ALPHA) -sin(ALPHA) 0 0;
  sin(ALPHA) cos(ALPHA)  0 0;
  0          0           1 0;
  0          0           0 1
]

T_d(t) = [
  cos(ω_d(t))  0 sin(ω_d(t)) 0;
  0            1 0           0;
  -sin(ω_d(t)) 0 cos(ω_d(t)) 0;
  0            0 0           1
]

T_p(ϕ, θ) = begin
  lat = σ(ϕ)
  long = η(θ)
  [
    -sin(long) cos(lat)*cos(long) sin(lat)*cos(long) RADIUS*sin(lat)*cos(long);
    0          -sin(lat)          cos(lat)           RADIUS*cos(lat)          ;
    cos(long)  cos(lat)*sin(long) sin(lat)*sin(long) RADIUS*sin(lat)*sin(long);
    0          0                  0                  1
  ]
end

T_A(β, γ) = [
  cos(β) -sin(β)*sin(γ) -sin(β)*cos(γ) 0;
  0      cos(γ)         -sin(γ)        0;
  sin(β) cos(β)*sin(γ)  cos(β)*cos(γ)  0;
  0      0              0              1
]

# important vectors in the local earth frame
radiation_m(t, ϕ, θ) = begin
  s = (inv(T_y(t) * T_a * T_d(t) * T_p(ϕ, θ)) * [0 ; 0 ; 0; 1])[1:3]
  -DISTANCE^2 * s / norm(s)^3
end

panel_normal_m(β, γ) = (T_A(β, γ) * [0; 0; 1; 0])[1:3]

power(t, ϕ, θ, β, γ) = begin
  r = radiation_m(t, ϕ, θ)
  r[3] <= 0 ? max(-dot(r, panel_normal_m(β, γ)), 0) : 0
end

# quadrature approximation of energy function
function energy(t0, t1, ϕ, θ, β, γ) 
  quadgk(t -> power(t, ϕ, θ, β, γ), t0, t1)[1]
end

# optimization
function optimize_angle(t0, t1, ϕ, θ; init=[0.0, 0.0], kwargs...)
  objective = action -> -energy(t0, t1, ϕ, θ, action...)
  optimize(objective, init, GradientDescent(), autodiff=:forward, Options(;kwargs...))
end
