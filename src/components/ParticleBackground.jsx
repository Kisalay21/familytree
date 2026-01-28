import React, { useEffect, useRef } from 'react';

const ParticleBackground = () => {
    const canvasRef = useRef(null);

    // Default settings to match the previous aesthetic
    const settings = {
        density: 80,
        speed: 0.2,
        starSize: 1.5,
        connectionDistance: 150,
        starColor: '#ffffff',
        lineColor: '#a855f7', // Purple
        backgroundColor: 'radial-gradient(circle at center, #1e1b4b 0%, #000000 80%)'
    };

    const settingsRef = useRef(settings);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        let particles = [];

        let mouseX = -1000;
        let mouseY = -1000;

        // Helper to convert hex to rgb for opacity handling
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 168, g: 85, b: 247 };
        };

        const initParticles = (count) => {
            // If expanding
            if (particles.length < count) {
                const toAdd = count - particles.length;
                for (let i = 0; i < toAdd; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        vx: (Math.random() - 0.5) * 0.5,
                        vy: (Math.random() - 0.5) * 0.5,
                        size: (Math.random() * 2 + 0.5), // Base size, scaled later
                    });
                }
            }
            // If shrinking
            else if (particles.length > count) {
                particles.splice(count);
            }
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            // Re-init with current settings
            initParticles(settingsRef.current.density);
        };

        const handleMouseMove = (e) => {
            // Event listener is on window, so this still works even if canvas is pointer-events-none
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const animate = () => {
            const current = settingsRef.current;

            // Dynamic Resizing of array if density changes
            if (particles.length !== current.density) {
                initParticles(current.density);
            }

            // Clear / Background
            if (current.backgroundColor.includes('gradient')) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            } else {
                ctx.fillStyle = current.backgroundColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            const starRgb = hexToRgb(current.starColor);
            const lineRgb = hexToRgb(current.lineColor);

            // Update and draw
            particles.forEach((p, i) => {
                // Move (apply speed)
                p.x += p.vx * current.speed;
                p.y += p.vy * current.speed;

                // Bounce
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Draw Dot
                const actualSize = p.size * (current.starSize / 2); // Scale based on setting
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0.1, actualSize), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${starRgb.r}, ${starRgb.g}, ${starRgb.b}, 0.8)`;
                ctx.fill();

                // Connect
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < current.connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        const opacity = 1 - distance / current.connectionDistance;
                        ctx.strokeStyle = `rgba(${lineRgb.r}, ${lineRgb.g}, ${lineRgb.b}, ${opacity * 0.4})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }

                // Mouse Interact
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const distMouse = Math.sqrt(dx * dx + dy * dy);
                const mouseRange = 200;

                if (distMouse < mouseRange) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouseX, mouseY);
                    const opacity = 1 - distMouse / mouseRange;
                    // Mouse line is usually brighter
                    ctx.strokeStyle = `rgba(${starRgb.r}, ${starRgb.g}, ${starRgb.b}, ${opacity * 0.5})`;
                    ctx.stroke();
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    const style = {
        background: settings.backgroundColor.includes('gradient') ? settings.backgroundColor : undefined
    };

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none transition-colors duration-500"
            style={style}
        />
    );
};

export default ParticleBackground;
