'use strict'

class LineCoordinates {
  constructor (args) {
    // Args must contain x1, y1, and either x2 & x2 or length & angle (radians or degrees)

    this.x1 = args.x1
    this.y1 = args.y1

    if ('radians' in args) {
      this.applyRadians(args.radians)
    } else if ('degrees' in args) {
      this.applyDegrees(args.degrees)
    } else {
      this.applyRadians(LineCoordinates.radiansFromXY(args))
    }
    this.length = ('length' in args) ? args.length : LineCoordinates.lineLengthFromXY(args)

    if (!('x2' in args) || !('y2' in args)) Object.assign(args, LineCoordinates.lineEndpoints(this))
    this.x2 = args.x2
    this.y2 = args.y2
  }

  applyRadians (radians) {
    this.radians = radians
    const degrees = LineCoordinates.radiansToDegrees(radians)
    this.degrees = LineCoordinates.enforceDegreesRange(degrees)
  }
  applyDegrees (degrees) {
    this.degrees = LineCoordinates.enforceDegreesRange(degrees)
    this.radians = LineCoordinates.degreesToRadians(degrees)
  }

  preventBackwardsAngle (parentDegrees, acceptableRange) {
    const isAngleBackwards = this.isAngleBackwards(parentDegrees, acceptableRange)

    if (isAngleBackwards) {
      this.applyDegrees(isAngleBackwards.acceptableAngle)
      const { x2, y2 } = LineCoordinates.lineEndpoints(this)

      this.x2 = x2
      this.y2 = y2
    }
  }

  isAngleBackwards (parentDegrees = 90, acceptableRange = 90) {
    // If this is the line from B to C, parentDegrees is the angle from A towards B
    // Make sure this line isn't pointing back towards A
    const degrees = LineCoordinates.radiansToDegrees(this.radians)
    const relativeDegrees = LineCoordinates.enforceDegreesRange(degrees - parentDegrees)

    if (relativeDegrees > acceptableRange) {
      // This relative angle is too high
      return {
        problem: '>',
        acceptableAngle: LineCoordinates.enforceDegreesRange(acceptableRange + parentDegrees)
      }
    }
    if (relativeDegrees < 0 - acceptableRange) {
      // This relative angle is too low
      return {
        problem: '<',
        acceptableAngle: LineCoordinates.enforceDegreesRange(0 - acceptableRange + parentDegrees)
      }
    }
    // This relative angle is fine
    return false
  }

  static lineEndpoints ({length, radians, x1, y1}) {
    return {
      x2: x1 + length * Math.cos(radians),
      y2: y1 + length * Math.sin(radians)
    }
  }

  static lineLengthFromXY ({x1, y1, x2, y2}) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }

  static radiansFromXY ({x1, y1, x2, y2}) {
    return Math.atan2(y2 - y1, x2 - x1)
  }

  static radiansToDegrees (radians) {
    return radians * 57.2957795
  }

  static degreesToRadians (degrees) {
    return degrees / 57.2957795
  }

  static reverseRadians (radians) {
    return radians - Math.PI
  }

  static enforceDegreesRange (degrees) {
    // Keep angles between -180 and 180
    if (degrees < -180) degrees += 360
    if (degrees > 180) degrees -= 360
    return degrees
  }
}

module.exports = LineCoordinates