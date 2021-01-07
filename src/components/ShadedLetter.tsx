import {ReactNode, useRef} from 'react';

function calcTextShadow(
    theta: number,
    phi: number,
    maxLightness: number,
    minLightness: number,
    color: {hue: number; sat: number; light: number}
) {
    let shadowRadius = 4;
    let numShadows = 25;
    let a = 1.04724;
    let b = 0.9 - 0.6 * phi;
    let f = (x: number) => {
        return a ** x - a;
    };

    let textShadow = '0px 0px 0px rgba(0, 0, 0, 0)';
    for (let i = 0; i < numShadows; i++) {
        let j = i % 2 === 0 ? i / 2 : numShadows - (i - 1) / 2;

        let ang = j * ((2 * Math.PI) / numShadows) + theta;
        let x = shadowRadius * Math.cos(ang);
        let y = shadowRadius * Math.sin(ang);
        let lightness = (Math.abs(j * 2 - numShadows) / numShadows) * 100;

        lightness =
            b < 0.5
                ? 2 * b * f(lightness)
                : 2 * (1 - b) * f(lightness) + 100 - 2 * (1 - b) * f(100);

        let newShadow = `, ${x}px ${y}px 0.5px hsl(${color.hue}deg, ${
            color.sat
        }%, ${
            lightness *
                (color.light / 100) *
                ((maxLightness - minLightness) / 100) +
            minLightness
        }%)`;
        textShadow += newShadow;
    }
    return textShadow;
}

function calcMouseDir(origin: number[], mousePos: number[]) {
    let xFromOrigin = mousePos[0] - origin[0];
    let yFromOrigin = mousePos[1] - origin[1];

    let theta = Math.atan2(yFromOrigin, xFromOrigin);
    let phi = Math.atan2(Math.sqrt(xFromOrigin ** 2 + yFromOrigin ** 2), 2000);
    return [theta, phi];
}

export default function ShadedLetter({
    children,
    mousePos,
    maxLightness,
    minLightness,
    color,
    selected = false,
    selectionStart = false,
    selectionEnd = false
}: {
    children: ReactNode;
    mousePos: number[];
    maxLightness: number;
    minLightness: number;
    color: {hue: number; sat: number; light: number};
    selected?: boolean;
    selectionStart?: boolean;
    selectionEnd?: boolean;
}) {
    const charRef = useRef(null);

    let boundingBox = charRef.current?.getBoundingClientRect() || {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    };
    let charCenter = [
        (boundingBox.right + boundingBox.left) / 2,
        (boundingBox.bottom + boundingBox.top) / 2
    ];
    let mouseDir = calcMouseDir(charCenter, mousePos) as [number, number];
    let textShadow = calcTextShadow(
        ...mouseDir,
        maxLightness,
        minLightness,
        color
    );

    let borderRadius = 10;

    return (
        <span
            style={{
                color: `hsl(${color.hue}deg, ${color.sat}%, ${
                    Math.cos(mouseDir[1]) *
                        (color.light / 100) *
                        maxLightness *
                        0.9 +
                    minLightness
                }%)`,
                background: selected
                    ? `hsl(${color.hue}deg, ${color.sat}%, ${
                          color.light - 20
                      }%)`
                    : 'transparent',
                borderRadius: `${selectionStart ? borderRadius : 0}px ${
                    selectionEnd ? borderRadius : 0
                }px ${selectionEnd ? borderRadius : 0}px ${
                    selectionStart ? borderRadius : 0
                }px`,
                textShadow
            }}
            ref={charRef}
        >
            {children}
        </span>
    );
}
