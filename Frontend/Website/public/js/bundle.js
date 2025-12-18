import { useEffect, useRef } from 'react';

function Carousel() {
    const itemRef = useRef(null);

    useEffect(() => {
        if (itemRef.current) {
            itemRef.current.classList.add('active');
        }
    }, []);

    return <div ref={itemRef} className="carousel-item">Slide 1</div>;
}
