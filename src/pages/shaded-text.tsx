import Head from 'next/head';
import {useEffect, useRef, useState} from 'react';

import styles from './shaded-text.module.scss';
import ShadedLetter from '../components/ShadedLetter';
import {clamp, isTouchDevice} from '../misc/util';

let minLightness = 10;
let maxLightness = 90;

export default function Home() {
    const [text, setText] = useState('Click to edit me!');
    const [mousePos, setMousePos] = useState([0, 0]);
    const [selection, setSelection] = useState([0, 0]);
    const [color, setColor] = useState({hue: 0, sat: 50, light: 60});
    const [isLoaded, setIsLoaded] = useState(false);
    let inputRef = useRef(null);

    useEffect(() => {
        setIsLoaded(true);

        function handleMouseMove(evt: MouseEvent) {
            setMousePos([evt.clientX, evt.clientY]);

            if (evt.buttons === 1) {
                setColor((prevColor) => ({
                    hue:
                        prevColor.hue +
                        (evt.movementX / window.innerWidth) * 180,
                    sat: clamp(
                        prevColor.sat -
                            (evt.movementY / window.innerHeight) * 100,
                        0,
                        100
                    ),
                    light: 60
                }));
            }
        }
        document.addEventListener('mousemove', handleMouseMove);

        let prevTouchPos: number[] = [null, null];
        function handleTouchMove(evt: TouchEvent) {
            if (evt.touches.length === 0) return;
            if (prevTouchPos[0] === null) {
                var dx = 0;
                var dy = 0;
            } else {
                var dx = evt.touches[0].clientX - prevTouchPos[0];
                var dy = evt.touches[0].clientY - prevTouchPos[1];
            }

            setColor((prevColor) => ({
                hue: prevColor.hue + (dx / window.innerWidth) * 180,
                sat: clamp(
                    prevColor.sat - (dy / window.innerHeight) * 100,
                    0,
                    100
                ),
                light: 60
            }));

            prevTouchPos = [evt.touches[0].clientX, evt.touches[0].clientY];
        }
        document.addEventListener('touchmove', handleTouchMove);

        function handleTouchStart(evt: TouchEvent) {
            evt.touches[0] &&
                setMousePos([evt.touches[0].clientX, evt.touches[0].clientY]);
            prevTouchPos = [null, null];
        }
        document.addEventListener('touchstart', handleTouchStart);

        function handleSelectionChange() {
            setSelection([
                inputRef.current.selectionStart,
                inputRef.current.selectionEnd
            ]);
        }
        document.addEventListener('selectionchange', handleSelectionChange);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener(
                'selectionchange',
                handleSelectionChange
            );
        };
    }, []);

    useEffect(() => {
        inputRef.current.scrollTo(0, 0);
    });

    let lightEnd = `hsl(${color.hue}deg, ${color.sat}%, ${
        (color.light / 100) * maxLightness * 0.4
    }%)`;
    let darkEnd = `hsl(${color.hue}deg, ${color.sat}%, ${
        color.light / 100 + minLightness
    }%)`;

    // Work around Safari bugs dealing with word wraps
    let isSafari = process.browser && /AppleWebKit\//.test(navigator.userAgent);

    return (
        <div
            className={styles.container}
            style={{
                background: `
                radial-gradient(${
                    process.browser
                        ? Math.max(window.innerWidth, window.innerHeight) + 'px'
                        : '100vw'
                } at ${mousePos[0]}px ${mousePos[1]}px, ${lightEnd}, ${darkEnd}
            `
            }}
        >
            <Head>
                <title>Shaded Text Demo</title>
                <link
                    rel="stylesheet"
                    href="https://use.typekit.net/wyb4ytz.css"
                />
            </Head>
            <style jsx global>{`
                body {
                    overscroll-behavior: contain;
                }
            `}</style>
            <div className={styles['text-container']}>
                <textarea
                    className={`${styles.title} ${styles.input} ${
                        isSafari ? styles.safari : ''
                    }`}
                    onMouseDown={(evt) => {
                        evt.stopPropagation();
                    }}
                    onInput={(evt: React.ChangeEvent<HTMLTextAreaElement>) => {
                        setText(evt.target.value);
                    }}
                    spellCheck="false"
                    ref={inputRef}
                    style={{
                        caretColor: `hsl(${color.hue}deg, ${color.sat}%, ${color.light}%)`
                    }}
                >
                    {text}
                </textarea>
                <span
                    className={`${styles.title} ${styles.display} ${
                        isSafari ? styles.safari : ''
                    }`}
                >
                    {text.split('').map(([letter], i) => (
                        <ShadedLetter
                            mousePos={mousePos}
                            maxLightness={maxLightness}
                            minLightness={minLightness}
                            color={color}
                            selected={i >= selection[0] && i < selection[1]}
                            selectionStart={i === selection[0]}
                            selectionEnd={i === selection[1] - 1}
                        >
                            {letter}
                        </ShadedLetter>
                    ))}
                </span>
            </div>
            <p
                className={styles['info-text']}
                style={{
                    color: `hsl(${color.hue}deg, ${color.sat}%, ${color.light}%)`
                }}
            >
                (Drag on the background to change the color
                {isLoaded
                    ? isTouchDevice()
                        ? '; tap to change light position'
                        : ''
                    : ''}
                )
            </p>
        </div>
    );
}
