        lucide.createIcons();

        // Init Lenis Smooth Scroll
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Link Lenis scroll to GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0, 0);

        // Apple Video Parallax Implementation (Bulletproof Local Loader)
        gsap.registerPlugin(ScrollTrigger);

        const video = document.getElementById("bg-video");
        let scrubInitialized = false;
        
        function initVideoScrub() {
            if(scrubInitialized) return;
            scrubInitialized = true;
            
            video.style.opacity = "0.6";

            let proxy = { time: 0 };
            
            // GSAP handles calculating the target progress smoothly
            gsap.to(proxy, {
                time: () => video.duration || 1,
                ease: "none",
                scrollTrigger: {
                    trigger: document.documentElement,
                    start: "top top",
                    endTrigger: "#investment-projects",
                    end: "top 30%",
                    scrub: 0.5,
                }
            });

            // Decoupled Video Update Loop
            let lastUpdate = 0;
            function renderVideo() {
                if (video.readyState >= 1 && video.duration > 0) {
                    const now = performance.now();
                    // CRITICAL: Throttle DOM currentTime assignments to ~25 FPS (40ms).
                    // Without this throttle, the browser's video decoder queue fills up,
                    // blocking frame paints until scrolling completely stops!
                    if (now - lastUpdate > 40) {
                        let diff = Math.abs(video.currentTime - proxy.time);
                        if (diff > 0.01) {
                            video.currentTime = proxy.time;
                            lastUpdate = now;
                        }
                    }
                }
                requestAnimationFrame(renderVideo);
            }
            
            // Start the decoupled loop
            requestAnimationFrame(renderVideo);
        }

        // Ensure video is properly loaded before mounting to timeline
        if (video.readyState >= 1) {
            initVideoScrub();
        } else {
            video.addEventListener("loadedmetadata", initVideoScrub);
            video.addEventListener("canplay", initVideoScrub);
        }

        // CRITICAL FIX: Fonts and styles expanding the DOM height happen *after* initial JS runs.
        // This caused the timeline to calculate a short body height and end at the "comecinho".
        window.addEventListener("load", () => {
            initVideoScrub();
            video.pause();
            ScrollTrigger.refresh(true); // Forces GSAP to recalculate the exact new height 
        });

        // Extra polish: GSAP Reveals for elements scrolling into view
        const revealElements = document.querySelectorAll('.gsap-reveal');
        revealElements.forEach((el) => {
            gsap.fromTo(el, 
                { opacity: 0, y: 80 },
                { 
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%", // Trigger when element hits 85% of viewport
                    },
                    opacity: 1, 
                    y: 0, 
                    duration: 1.2, 
                    ease: "power3.out"
                }
            );
        });

        // ----------------------------------------------------
        // Custom Cursor Logic with GSAP Multi-Track Interpolation
        // ----------------------------------------------------
        const dot = document.querySelector('.cursor-dot');
        const c1 = document.querySelector('.cursor-circle-1');
        const c2 = document.querySelector('.cursor-circle-2');
        const c3 = document.querySelector('.cursor-circle-3');
        const allCursors = [dot, c1, c2, c3];

        // Center elements (xPercent/yPercent) so exact bounding boxes center on pointer
        gsap.set(allCursors, { xPercent: -50, yPercent: -50 });

        // High-performance GSAP quick setters
        const xDot = gsap.quickTo(dot, "x", {duration: 0.05, ease: "power3"});
        const yDot = gsap.quickTo(dot, "y", {duration: 0.05, ease: "power3"});

        const xC1 = gsap.quickTo(c1, "x", {duration: 0.15, ease: "power3"});
        const yC1 = gsap.quickTo(c1, "y", {duration: 0.15, ease: "power3"});

        const xC2 = gsap.quickTo(c2, "x", {duration: 0.3, ease: "power3"});
        const yC2 = gsap.quickTo(c2, "y", {duration: 0.3, ease: "power3"});

        const xC3 = gsap.quickTo(c3, "x", {duration: 0.5, ease: "power3"});
        const yC3 = gsap.quickTo(c3, "y", {duration: 0.5, ease: "power3"});

        let mouseHasMoved = false;

        window.addEventListener("mousemove", (e) => {
            if (!mouseHasMoved) {
                gsap.to(allCursors, {opacity: 1, duration: 0.5});
                mouseHasMoved = true;
            }
            xDot(e.clientX);
            yDot(e.clientY);
            
            xC1(e.clientX);
            yC1(e.clientY);
            
            xC2(e.clientX);
            yC2(e.clientY);
            
            xC3(e.clientX);
            yC3(e.clientY);
        });

        // Add magnetic / hover state interactions
        const interactives = document.querySelectorAll('a, button, [role="button"], .btn-3d, .electric-card');
        interactives.forEach(el => {
            if (el) {
                el.addEventListener("mouseenter", () => {
                    gsap.to(dot, {scale: 1.5, duration: 0.3});
                    gsap.to(c1, {scale: 1.5, borderColor: "rgba(249,115,22,0.8)", backgroundColor: "rgba(249,115,22,0.1)", duration: 0.3});
                    gsap.to(c2, {scale: 1.2, borderColor: "rgba(249,115,22,0.4)", duration: 0.3});
                    gsap.to(c3, {scale: 0.8, opacity: 0, duration: 0.3});
                });
                el.addEventListener("mouseleave", () => {
                    gsap.to(dot, {scale: 1, duration: 0.3});
                    gsap.to(c1, {scale: 1, borderColor: "rgba(249,115,22,0.4)", backgroundColor: "transparent", duration: 0.3});
                    gsap.to(c2, {scale: 1, borderColor: "rgba(255,255,255,0.15)", duration: 0.3});
                    gsap.to(c3, {scale: 1, opacity: 1, duration: 0.3});
                });
            }
        });

        // Global Mousedown Feedback (Cursor Constriction)
        window.addEventListener("mousedown", () => {
            gsap.to(dot, {scale: 0.5, backgroundColor: "#fff", duration: 0.15});
            gsap.to(c1, {scale: 0.8, borderColor: "rgba(255,255,255,0.8)", duration: 0.15});
        });
        window.addEventListener("mouseup", () => {
            gsap.to(dot, {scale: 1, backgroundColor: "#f97316", duration: 0.3});
            gsap.to(c1, {scale: 1, borderColor: "rgba(249,115,22,0.4)", duration: 0.3});
        });

        // ----------------------------------------------------
        // Data Fold Animations (ScrollTrigger)
        // ----------------------------------------------------
        const dataFold = document.getElementById('data-fold');
        const sphereBg = document.getElementById('sphere-bg');
        const dataReveals = document.querySelectorAll('.data-reveal');

        if (dataFold) {
            let dataTl = gsap.timeline({
                scrollTrigger: {
                    trigger: dataFold,
                    start: "top 70%", // Trigger when top of fold is 70% down viewport
                    end: "bottom 30%",
                    toggleActions: "play reverse play reverse", 
                }
            });

            // Animate Sphere in
            dataTl.fromTo(sphereBg, 
                { opacity: 0, scale: 0.3 },
                { opacity: 1, scale: 1, duration: 2, ease: "power3.out" }
            );

            // Stagger text and button
            dataTl.fromTo(dataReveals,
                { opacity: 0, y: 50 },
                { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, ease: "power3.out" },
                "-=1.2" // Start during the sphere animation
            );

            // Added Parallax Polish for Fold 2
            gsap.to('#sphere-wrapper', {
                yPercent: 20, // Move sphere down slightly as you scroll down
                ease: "none",
                scrollTrigger: {
                    trigger: dataFold,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });

            gsap.to('.data-parallax-container', {
                yPercent: -15, // Move text up slightly faster than scroll
                ease: "none",
                scrollTrigger: {
                    trigger: dataFold,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }

        // ----------------------------------------------------
        // CTA Fold Animations (ScrollTrigger)
        // ----------------------------------------------------
        const ctaReveals = document.querySelectorAll('.cta-reveal');
        const ctaFold = document.getElementById('cta-fold');
        
        if (ctaReveals.length > 0 && ctaFold) {
            gsap.fromTo(ctaReveals,
                { opacity: 0, y: 150, rotationX: -20, transformPerspective: 1000 },
                {
                    opacity: 1, 
                    y: 0, 
                    rotationX: 0,
                    duration: 1.5, 
                    stagger: 0.15, 
                    ease: "back.out(1.2)",
                    scrollTrigger: {
                        trigger: ctaFold,
                        start: "top 60%", 
                        toggleActions: "play reverse play reverse"
                    }
                }
            );
        }
