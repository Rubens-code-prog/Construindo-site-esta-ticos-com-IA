document.addEventListener("DOMContentLoaded", function () {
    if (jQuery(".wpm-sf-modal").length) {
        jQuery(".wpm-sf-modal").each(function (index, el) {
            if (jQuery(el).attr("class").indexOf("wpm-f-size") > -1) {
                jQuery(el)
                    .attr("class")
                    .split(" ")
                    .forEach(function (cls) {
                        if (cls.indexOf("wpm-f-size-") !== -1) {
                            let size = cls.split("wpm-f-size-")[1].split("-");
                            jQuery(el).attr({
                                "data-width": size[0],
                                "data-height": size[1],
                            });
                        }
                    });
            }
        });

        jQuery(".wpm-sf-modal").fancybox({
            touch: false,
            smallBtn: true,
            autoFocus: false,
            backFocus: false,
            toolbar: false,
            baseClass: "wpm-f-layout wpm-sf-layout",
            btnTpl: {
                smallBtn:
                    '<button type="button" data-fancybox-close class="wpm-f-modal-close fancybox-button fancybox-close-small" title="{{CLOSE}}"><svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17.7778" fill="black"/><path d="M26.2957 11.3742L24.6246 9.70312L18 16.3283L11.3742 9.70312L9.70312 11.3742L16.3283 18L9.70312 24.6246L11.3742 26.2957L18 19.6705L24.6246 26.2957L26.2957 24.6246L19.6705 18L26.2957 11.3742Z" fill="white"/></svg></button>',
            },
            video: {
                tpl: '<video class="fancybox-video" controls controlsList="nodownload" poster="{{poster}}"><source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos, <a href="{{src}}">download</a> and watch with your favorite video player!</video>',
                format: "",
                autoStart: true,
            },
            beforeLoad: function (instance, slide) {
                const src = slide.src;

                // Match against all current Wistia URL formats
                const wistiaRegex = /https?:\/\/[^.]+\.(wistia\.com|wi\.st)\/(medias|embed)\/([^?&"'>]+)/;

                const match = src.match(wistiaRegex);

                if (match) {
                    // Extract hashed ID
                    const wistiaId = match[3];

                    // Force embed URL only if not already using fast.wistia.net iframe format
                    if (!src.includes("fast.wistia.net/embed/iframe/")) {
                        slide.type = "iframe";
                        slide.src = `https://fast.wistia.net/embed/iframe/${wistiaId}`;
                    } else {
                        slide.type = "iframe"; // it's already the right format
                    }
                } else if (src && src.endsWith(".mp4")) {
                    slide.type = "video";
                }
            },
            afterShow: function (instance, slide) {
                const video = slide.$slide.find("video");
                if (video.length) {
                    video.on("ended", function () {
                        jQuery.fancybox.close();
                    });
                }
            },
            beforeClose: function (instance, slide) {
                if (slide.type === "video") {
                    const video = slide.$content.find("video")[0];
                    if (video) {
                        localStorage.setItem("videoPosition", video.currentTime);
                    }
                }
            },
            afterClose: function (instance, slide) {
                if (slide.type === "video") {
                    const videoEl = jQuery(".wpm-sf-modal").find("video").get(0);
                    const pos = localStorage.getItem("videoPosition") || 0;
                    if (videoEl) {
                        videoEl.currentTime = pos;
                        jQuery(".video-hp").removeClass("active");
                        jQuery(".js-hp-video-unmuted").show();
                        videoEl.muted = true;
                        videoEl.play();
                    }
                }
            },
        });
    }
});
