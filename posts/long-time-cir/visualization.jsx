import React from 'react'
import * as d3 from 'd3';
import fp from 'lodash/fp';
import * as math from 'mathjs';

import data from './data.json';

// parse the data and downsample
const { a, b, sigma } = data;
const samples = data.samples.map(sample => sample.filter((_, i) => i % 10 === 0));
const times = samples[0].map(d => d.t);
const T = times[times.length - 1];

// encode properties of the long-time distribution
const shape = 2 * a * b / math.pow(sigma, 2);
const rate = 2 * a / math.pow(sigma, 2);
const trueDensity = x => (
  math.pow(rate, shape) * math.pow(x, shape - 1) * 
  math.exp(-rate * x) / math.gamma(shape)
);

// create a kernel for density estimation
const kernel = (x, center, bandwidth) => (
  math.abs(x - center) <= bandwidth
  ? 0.75 * (1 - math.pow((x - center) / bandwidth, 2)) / bandwidth
  : 0.0
)

export default function Visualization(props) {
  // create a ref so d3 may manipulate the dom
  const ref = React.useRef();

  // parse the props
  const {
    trajectoryDims=[650, 280],
    metaHeight=255,
    paddingTop=80,
    paddingRight=20,
    margins={ top: 10, right: 30, bottom: 20, left: 40 },
    bandwidth=0.5,
    trajectoryColor='rgb(150, 180, 255)',
    empiricalColor='green',
    trueColor='red',
  } = props;

  // allow d3 to perform updates
  React.useEffect(() => {

    // create and append the svg
    const svg = d3.select(ref.current)
      .append('svg')
      .attr("width", trajectoryDims[0] + margins.left + margins.right)
      .attr("height",
        trajectoryDims[1] + metaHeight + margins.bottom +
          margins.top + paddingTop
      );

    /**
    * Append Legend
    */
    const legend = svg.append("g")
      .attr("transform",
        `translate(
          ${trajectoryDims[0] + margins.left},
          ${trajectoryDims[1] + paddingTop}
        ) rotate(90)`
      );
    legend.append("rect")
      .attr("fill", empiricalColor)
      .attr("x", 0)
      .attr("y", -8)
      .attr("height", 8)
      .attr("width", 15);
    legend.append("text").text("empirical").attr("x", 20);
    legend.append("rect")
      .attr("fill", trueColor)
      .attr("x", 0)
      .attr("y", -8 + 18)
      .attr("height", 8)
      .attr("width", 15);
    legend.append("text").text("limit").attr("x", 20).attr("y", 18);


    /**
    * Trajectory plot
    */
    // create the plot region
    const plot = svg.append("g")
      .attr("transform", `translate(${margins.left}, ${margins.top})`);

    // create the scales
    const timeScale = d3.scaleLinear()
      .domain([0,T])
      .range([0, trajectoryDims[0]]);

    const spaceScale = d3.scaleLinear()
      .domain([0, d3.max(samples, d => 1.05 * d3.max(d, fp.get("xt")))])
      .range([trajectoryDims[1], 0]);

    // create the updater for the trajectories
    const update_trajectory = (isBefore, index) => (
      plot
      .selectAll(`.${isBefore ? "before" : "after"}`)
      .data(
        samples.map(sample => (
          isBefore ? sample.slice(0, index) : sample.slice(math.max(index-1, 0))
        ))
      )
      .join("path")
      .attr("class", isBefore ? "before" : "after")
      .attr("d", d3.line().x(r => timeScale(r.t)).y(r => spaceScale(r.xt)))
      .attr("stroke", trajectoryColor)
      .attr("stroke-opacity", isBefore ? 1 : 0.25)
      .attr("stroke-width", "0.5")
      .attr("fill", "none")
    );

    // append trajectories
    const startIndex = 25;
    update_trajectory(true, startIndex);
    update_trajectory(false, startIndex);

    // create the updater for the circles
    const update_circles = points => (
      plot
      .selectAll(".dot")
      .data(points)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", d => timeScale(d.t))
      .attr("cy", d => spaceScale(d.xt))
      .attr("r", "1")
      .attr("fill", empiricalColor)
      .style("fill-opacity", "1")
    );

    // append circles
    const startPoints = samples.map(sample => sample[startIndex - 1]);
    update_circles(startPoints);

    // append axes
    plot.append("g")
      .attr("transform", `translate(0, ${trajectoryDims[1]})`)
      .call(d3.axisBottom(timeScale));

    plot.append("g").call(d3.axisLeft(spaceScale));

    /**
    * MGF plot
    */
    const mgf = svg.append("g")
      .attr(
        "transform",
        `translate(
          ${margins.left},
          ${margins.top + paddingTop + trajectoryDims[1]}
        )`
      );

    // create u-scale
    const uMax = 0.5 * (2 * a / math.pow(sigma, 2))
    const uScale = d3.scaleLinear()
      .domain([0, uMax])
      .range([0, (trajectoryDims[0] - paddingRight) / 2]);

    const mgfMax = 50000.0
    const mgfScale = d3.scaleLog()
      .domain([1, mgfMax])
      .range([metaHeight, 0]);

    // append true mgf
    const meshSize = 100;
    const mgfData = Array.from({ length: meshSize + 1 })
      .map((_, i) => {
        const u = i * uMax / meshSize;
        const expu = math.pow(
          1 - 0.5 * math.pow(sigma, 2) * u / a,
          -2 * a * b / math.pow(sigma, 2)
        );
        return { u, expu }
      })
      .filter(({ expu }) => expu < mgfMax );

    mgf.append("path")
      .attr("class", "mgf")
      .attr("d",
        d3.line()
          .x(d => uScale(d.u))
          .y(d =>mgfScale(d.expu))
          (mgfData)
      )
      .attr("fill", "none")
      .attr("stroke", trueColor)
      .attr("stroke-width", 1);

    // create updater for empirical mgf curve
    const update_mgf = points => {
      const curveData = Array.from({ length: meshSize + 1})
        .map((_, i) => {
          const u = i * uMax / meshSize;
          const expu = points.reduce(
            (acc, { xt }) => acc + math.exp(u * xt) / points.length,
            0
          );
          return { u, expu };
        })
        .filter(({ expu }) => expu < mgfMax);
      return mgf
      .selectAll(".empirical-mgf")
      .data([curveData])
      .join("path")
      .attr("class", "empirical-mgf")
      .attr("d",
        d3.line().x(d => uScale(d.u)).y(d => mgfScale(d.expu))
      )
      .attr("fill", "none")
      .attr("stroke", empiricalColor)
      .attr("stroke-width", "1");
    };

    // append empirical mgf
    update_mgf(startPoints);

    // append axis
    mgf.append("g")
      .attr("transform", `translate(0, ${metaHeight})`)
      .call(d3.axisBottom(uScale));

    mgf.append("g").call(d3.axisLeft(mgfScale));

    // add title
    mgf.append("text")
      .text("moment generating functions")
      .attr("y", -paddingTop / 4);

    /**
    * density plot
    */
    const density = svg.append("g")
      .attr(
        "transform",
        `translate(
          ${margins.left + paddingRight + trajectoryDims[0] / 2},
          ${margins.top + paddingTop + trajectoryDims[1]}
        )`
      );

    // create density scales
    const maxDensityX = 6.0;
    const densityScaleX = d3.scaleLinear()
      .domain([0, maxDensityX])
      .range([0, (trajectoryDims[0] - paddingRight) / 2]);

    const maxDensityY = 0.8
    const densityScaleY = d3.scaleLinear()
      .domain([0, maxDensityY])
      .range([metaHeight, 0]);

    // append true density
    const densityData = Array.from({ length: meshSize + 1 })
      .map((_, i) => {
        const x = i * maxDensityX / meshSize;
        return { x, y: trueDensity(x) };
      });
    density.append("path")
      .attr("class", "density")
      .attr("d",
        d3.line()
          .x(d => densityScaleX(d.x))
          .y(d =>densityScaleY(d.y))
          (densityData)
      )
      .attr("fill", "none")
      .attr("stroke", trueColor)
      .attr("stroke-width", 1);

    // create density updater
    const update_density = points => {
      const curveData = Array.from({ length: meshSize + 1})
        .map((_, i) => {
          const x = i * maxDensityX / meshSize;
          const y = points.reduce(
            (acc, { xt }) => acc + kernel(x, xt, bandwidth) / points.length,
            0
          );
          return { x, y };
        })
        .filter(({ y }) => y < maxDensityY);
      return density
        .selectAll(".empirical-mgf")
        .data([curveData])
        .join("path")
        .attr("class", "empirical-mgf")
        .attr("d",
          d3.line().x(d => densityScaleX(d.x)).y(d => densityScaleY(d.y))
        )
        .attr("fill", "none")
        .attr("stroke", empiricalColor)
        .attr("stroke-width", "1");
    };

    // append empirical density
    update_density(startPoints);

    // append axis
    density.append("g")
      .attr("transform", `translate(0, ${metaHeight})`)
      .call(d3.axisBottom(densityScaleX));

    // create density point updater
    const update_points = points => (
      density
      .selectAll(".point")
      .data(points)
      .join("circle")
      .attr("class", "point")
      .attr("cx", d => densityScaleX(d.xt))
      .attr("cy", densityScaleY(0))
      .attr("r", "2")
      .attr("fill", empiricalColor)
      .attr("stroke", empiricalColor)
      .style("fill-opacity", "0.25")
    );

    // append density points
    update_points(samples[0].length);

    // append title
    density.append("text")
      .text("densities")
      .attr("y", -paddingTop / 4);

    /**
    * Interactivity
    */
    plot.on("mousemove", e => {
      const t = timeScale.invert(d3.pointer(e, plot.node())[0]);
      const index = d3.bisect(times, t);
      const points = samples.map(sample => sample[index-1]);
      update_trajectory(true, index);
      update_trajectory(false, index);
      update_circles(points);
      update_points(points);
      update_mgf(points);
      update_density(points);
    });

    // return cleanup
    const cleanup = () => svg.remove();
    return cleanup;
  }, [
    ref, 
    trajectoryDims, 
    metaHeight, 
    paddingTop, 
    paddingRight, 
    margins, 
    bandwidth, 
    trajectoryColor,
    empiricalColor,
    trueColor,
  ]);

  return (
    <blockquote style={{ overflowX: 'auto', overflowY: 'visible' }}>
      <div style={{ margin: '1em' }}>
        <div 
          ref={ ref }
          style={{ 
            background: 'white', 
            border: '1px solid var(--link)', 
            width: `${trajectoryDims[0] + margins.left + margins.right }px`,
            margin: '0 auto',
          }}
        />
      </div>
    </blockquote>
  );
}
