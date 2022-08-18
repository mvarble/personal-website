import React from 'react';
import fp from 'lodash/fp';
import { VictoryLine } from 'victory';

/**
 * create some constants for viewing colors
 */
const red = 'pink';
const green = 'lightgreen';
const blue = 'rgb(180, 180, 255)';
export { red, green, blue };

/*
 * this function tests a trajectory in a band
 */
function inBand(trajectory, lower, upper) {
  return trajectory.every(({ t, Xt }) => lower(t) <= Xt && Xt <= upper(t));
}
export { inBand };

/**
 * this is generates reducer that will group pandas dataframe rows by sample and 
 * flatmap rows with jumps to pairs of points (for visualizing discontinuities)
 *
 * input: row => string that tells us how to group samples
 * output: reducer
 *
 */
function sampleGroupBy(pathFunc) {
  return (acc, row) => (
    fp.update(pathFunc(row))(line => {
      const rows = (
        row.jump 
        ? [{ t: row.t, Xt: row.Xt - row.jump }, row]
        : [row]
      );
      return !line ? rows : [...line, ...rows];
    })(acc)
  );
}
export { sampleGroupBy };

/**
 * compose a VictoryLine to match our data structure
 */
function Line(props) {
  return <VictoryLine x="t" y="Xt" { ...props } />;
}
export { Line };
