import React from 'react';

export default function RatLogo({ fill='white', stroke='black', ...props }) {
  return (
    <svg viewBox="0 0 205.08469 111.3572" { ...props }>
      <g transform="translate(-3.4670886,-74.694931)">
        <path
          d="m 43.656249,136.5491 c 0,0 -28.915178,-3.40177 -36.8526776,12.66221 -11.4267526,23.12557 91.0922606,48.56994 126.6220186,24.56845"
          style={{
            fillOpacity: 0,
            stroke,
            strokeWidth: 5,
            strokeLinecap: 'round',
          }} />
        <ellipse
          transform="rotate(32.119107)"
          style={{
            display: 'inline',
            fill,
            stroke,
            strokeWidth: 2,
            strokeLinecap: 'round',
          }}
          ry="15.497023"
          rx="10.677827"
          cy="14.550406"
          cx="215.87437"/>
        <path
          d="m 200.70536,145.14806 c 0,0 -12.56547,14.97862 -23.46493,15.25715 -14.24899,0.36413 -10.53047,6.00401 -86.337155,4.68109 -31.412161,-0.54818 -56.885411,-20.01094 -56.885415,-44.69568 -2e-6,-24.684747 25.468466,-44.695689 56.885415,-44.695689 31.416945,0 63.837855,32.175579 109.802085,69.453129 z"
          style={{
            display: 'inline',
            fill,
            stroke,
            strokeWidth: 2,
            strokeLinecap: 'round',
          }}/>
        <path
          d="m -18.00583,203.13249 c -0.219533,-6.07955 2.033925,-11.78247 5.760293,-14.57783 3.7263688,-2.79536 8.2352718,-2.16526 11.52566723,1.61067 3.29039527,3.77593 4.75267507,9.99812 3.73788247,15.90518"
          style={{
            display: 'inline',
            fill,
            stroke,
            strokeWidth: 2,
            strokeLinecap: 'round',
          }}
          transform="rotate(-51.943053)" />
        <ellipse
          ry="2.0788691"
          rx="1.984375"
          cy="137.30505"
          cx="172.64062"
          style={{
            fill: stroke,
            stroke,
            strokeWidth: 5,
          }}/>
        <path
          d="m 197.05471,137.89916 5.22242,-9.69267"
          style={{
            fill: 'none',
            stroke,
            stokeWidth: 1,
            strokeLinecap: 'butt',
          }} />
        <path
          d="m 197.85765,140.2101 10.45844,-5.5898" 
          style={{
            fill: 'none',
            stroke,
            stokeWidth: 1,
            strokeLinecap: 'butt',
          }} />
        <path
          d="m 177.80637,143.85172 11.85562,-0.26242"
          style={{
            fill: 'none',
            stroke,
            stokeWidth: 1,
            strokeLinecap: 'butt',
          }} />
        <path
          d="m 181.30392,152.78779 9.42715,-7.19397"
          style={{
            fill: 'none',
            stroke,
            stokeWidth: 1,
            strokeLinecap: 'butt',
          }} />
      </g>
    </svg>
  );
}
