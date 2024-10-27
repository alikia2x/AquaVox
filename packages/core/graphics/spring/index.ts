import { Spring } from './spring';

export default function createSpring(
    from: number,
    to: number,
    bounce: number,
    duration: number,
    delaySeconds: number = 0,
) {
    const mass = 1;
    const stiffness = Math.pow((Math.PI * 2) / duration, 2);
    const damping = bounce >= 0 ? ((1 - bounce) * (4 * Math.PI)) / duration : ((1 + bounce) * (4 * Math.PI)) / duration;
    const spring = new Spring(from);
    spring.updateParams({ mass, stiffness, damping });
    spring.setTargetPosition(to, delaySeconds);
    return spring;
}
