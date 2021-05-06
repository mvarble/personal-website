import { Matrix4 } from 'three';

const cos = Math.cos;
const sin = Math.sin;
const PI = Math.PI;

export default function solarFrames({ D, R, TILT, DAYS }) {
  /**
   * angular timeframes
   */
  const omegaD = t => 2 * PI * t;
  const omegaY = t => omegaD(t) / DAYS;

  /**
   * map-to-spherical coordinate transforms
   */
  const fromLat = lat => PI * (lat - 90) / 180;
  const fromLong = long => PI * (180-long) / 180;

  /**
   * frames
   */
  const Tyear = t => new Matrix4().set(
    1, 0, 0, D * cos(omegaY(t)),
    0, 1, 0, 0,
    0, 0, 1, -D * sin(omegaY(t)),
    0, 0, 0, 1
  );

  const Ttilt = new Matrix4().set(
    cos(TILT), -sin(TILT), 0, 0,
    sin(TILT), cos(TILT) , 0, 0,
    0        , 0         , 1, 0,
    0        , 0         , 0, 1
  );

  const Tday = t => new Matrix4().set(
    cos(omegaD(t)), 0, sin(omegaD(t)), 0,
    0, 1, 0, 0,
    -sin(omegaD(t)), 0, cos(omegaD(t)), 0,
    0, 0, 0, 1
  );

  const Tmap = (lat, long) => {
    const phi = fromLat(lat);
    const theta = fromLong(long);
    return new Matrix4().set(
      -sin(theta), cos(phi) * cos(theta), sin(phi) * cos(theta), sin(phi) * cos(theta),
      0          , -sin(phi)            , cos(phi)             , cos(phi),
      cos(theta) , cos(phi) * sin(theta), sin(phi) * sin(theta), sin(phi) * sin(theta),
      0          , 0                    , 0                    , 1
    );
  };

  const Taction = (beta, gamma) => new Matrix4().set(
    cos(beta), -sin(beta)*sin(gamma), -sin(beta)*cos(gamma), 0,
    0, cos(gamma), -sin(gamma), 0,
    sin(beta), cos(beta)*sin(gamma), cos(beta)*cos(gamma), 0,
    0, 0, 0, 1
  );

  return {
    omegaD,
    omegaY,
    fromLat,
    fromLong,
    Tyear,
    Ttilt,
    Tday,
    Tmap,
    Taction,
  };
}
