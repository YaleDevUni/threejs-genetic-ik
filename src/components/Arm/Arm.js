// src/components/Arm/Arm.js
import { Group } from "three";
import createJoint from "./Joint.js";
import createLimb from "./Limb.js";
import * as THREE from "three";
class Arm {
  constructor() {
    this.armGroup = new Group();

    this.joints = [];
    this.limbs = [];

    const limbLengths = [3, 3, 1]; // Lengths for each limb

    const joint0 = createJoint();
    this.armGroup.add(joint0);
    this.joints.push(joint0);

    const limb0 = createLimb(limbLengths[0]);
    joint0.add(limb0);
    limb0.position.y = limbLengths[0] / 2; 
    this.limbs.push(limb0);

    // Second joint
    const joint1 = createJoint();
    limb0.add(joint1);
    joint1.position.y = limbLengths[0] / 2;
    this.joints.push(joint1);

    const limb1 = createLimb(limbLengths[1]);
    joint1.add(limb1);
    limb1.position.y = limbLengths[1] / 2;
    this.limbs.push(limb1);

    // Third joint
    const joint2 = createJoint();
    limb1.add(joint2);
    joint2.position.y = limbLengths[1] / 2;
    this.joints.push(joint2);

    const limb2 = createLimb(limbLengths[2]);
    joint2.add(limb2);
    limb2.position.y = limbLengths[2] / 2;
    this.limbs.push(limb2);

    this.endEffector = limb2;
  }

  getObject3D() {
    return this.armGroup;
  }

  /**
   * Sets the rotation angles for each joint.
   * @param {number[][]} angles - An array where each element is [x, y, z] rotation angles for a joint.
   */
  setJointAngles(angles) {
    // angles = [[x0, y0, z0], [x1, y1, z1], [x2, y2, z2]]
    this.joints.forEach((joint, index) => {
      if (angles[index]) {
        joint.rotation.x = angles[index][0];
        joint.rotation.y = angles[index][1];
        joint.rotation.z = angles[index][2];
      }
    });
  }

  // Compute forward kinematics: get end-effector world position
  getEndEffectorPosition() {
    this.armGroup.updateMatrixWorld(true);
    const position = this.endEffector.getWorldPosition(new THREE.Vector3());
    return position;
  }

  clone() {
    const clonedArm = new Arm();
    clonedArm.armGroup.position.copy(this.armGroup.position);
    clonedArm.armGroup.rotation.copy(this.armGroup.rotation);
    this.joints.forEach((joint, index) => {
      clonedArm.joints[index].rotation.copy(joint.rotation);
    });
    return clonedArm;
  }
}

export default Arm;
