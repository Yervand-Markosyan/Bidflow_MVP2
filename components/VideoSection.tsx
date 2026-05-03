
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  RotateCcw, 
  RotateCw, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';

interface VideoSectionProps {
  lang: Language;
}

export const VideoSection: React.FC<VideoSectionProps> = ({ lang }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [userHasUnmuted, setUserHasUnmuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showInitialMute, setShowInitialMute] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const muteTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = {
    en: {
      headline: "How Bidflow transforms procurement",
      description: "Bidflow simplifies the complex construction supply chain by connecting buyers and suppliers in a transparent, real-time marketplace.",
      benefits: [
        "Real-time bidding for best market prices",
        "Verified suppliers and quality assurance",
        "Streamlined communication and documentation"
      ],
      error: "Video could not be loaded. Please check your internet connection."
    },
    ar: {
      headline: "كيف يغير Bidflow عملية الشراء",
      description: "يبسط Bidflow سلسلة توريد البناء المعقدة من خلال ربط المشترين والموردين في سوق شفاف وفي الوقت الفعلي.",
      benefits: [
        "عطاءات في الوقت الفعلي لأفضل أسعار السوق",
        "موردون معتمدون وضمان الجودة",
        "تواصل مبسط وتوثيق سهل"
      ],
      error: "تعذر تحميل الفيديو. يرجى التحقق من اتصالك بالإنترنت."
    }
  }[lang];

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.8,
    };

    const fadeVolume = (targetVolume: number, duration: number = 1000) => {
      if (!videoRef.current) return;
      
      const startVolume = videoRef.current.volume;
      const delta = targetVolume - startVolume;
      const interval = 50; 
      const steps = duration / interval;
      const stepDelta = steps > 0 ? delta / steps : 0;
      
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      
      fadeIntervalRef.current = setInterval(() => {
        if (!videoRef.current) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          return;
        }
        
        let nextVolume = videoRef.current.volume + stepDelta;
        
        const isDone = (stepDelta > 0 && nextVolume >= targetVolume) || 
                       (stepDelta < 0 && nextVolume <= targetVolume) || 
                       (stepDelta === 0);

        if (isDone) {
          nextVolume = targetVolume;
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          if (nextVolume === 0) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
        
        videoRef.current.volume = nextVolume;
      }, interval);
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (videoRef.current && !hasError) {
          if (entry.isIntersecting) {
            // Start video
            videoRef.current.play().then(() => {
              setIsPlaying(true);
              
              // If user unmuted before, fade in volume
              if (userHasUnmuted) {
                videoRef.current!.muted = false;
                fadeVolume(1.0, 800);
              }
            }).catch(error => {
              console.log("Autoplay prevented or failed:", error);
            });

            // Handle mute button visibility timer
            setShowInitialMute(true);
            if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
            muteTimerRef.current = setTimeout(() => {
              setShowInitialMute(false);
            }, 5000);
          } else {
            // Fade out then pause
            if (!videoRef.current.muted && videoRef.current.volume > 0) {
              fadeVolume(0, 800);
            } else {
              videoRef.current.pause();
              setIsPlaying(false);
            }
            
            // Reset mute button state
            setShowInitialMute(false);
            if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFull);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    };
  }, [hasError, userHasUnmuted]);

  // Remove the pseudo-fullscreen useEffect that was locking body scroll

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
      
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      
      if (!newMutedState) {
        // Unmuting
        videoRef.current.volume = 1.0;
        setUserHasUnmuted(true);
        setIsMuted(false);
      } else {
        // Muting
        setUserHasUnmuted(false);
        setIsMuted(true);
      }
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const seek = (e: React.MouseEvent, amount: number) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime += amount;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullScreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = document as any;
    const container = containerRef.current as any;

    if (!container) return;

    const isFull = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    );

    if (isFull) {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
      
      // Unlock orientation when exiting
      if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
        try { window.screen.orientation.unlock(); } catch (err) { console.log(err); }
      }
    } else {
      const requestMethod = container.requestFullscreen || container.webkitRequestFullscreen || container.mozRequestFullScreen || container.msRequestFullscreen;
      
      if (requestMethod) {
        requestMethod.call(container).then(() => {
          // Lock to landscape on mobile when entering fullscreen
          if (window.screen && window.screen.orientation && (window.screen.orientation as any).lock) {
            (window.screen.orientation as any).lock('landscape').catch((err: any) => {
              console.log("Orientation lock failed:", err);
            });
          }
        }).catch(() => {});
      }
    }
  };

  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // If clicking a button, don't do anything here
    if ((e.target as HTMLElement).closest('button')) return;
    
    // On mobile/touch, we want to toggle controls visibility without pausing
    // On desktop, we can keep the same behavior or just toggle controls
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouch) {
      if (showControls) {
        setShowControls(false);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      } else {
        handleInteraction();
      }
    } else {
      // Desktop behavior: show controls and toggle play
      handleInteraction();
      togglePlay(e);
    }
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          {/* Video Container */}
          <div className="w-full lg:w-[45%]">
            <div 
              ref={containerRef}
              className="relative group cursor-pointer"
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => setShowControls(false)}
              onMouseMove={handleInteraction}
              onClick={handleContainerClick}
            >
              {/* Decorative background */}
              {!isFullscreen && <div className="absolute -inset-4 bg-brand-primary/10 rounded-[2.5rem] blur-2xl group-hover:bg-brand-primary/20 transition-all duration-500"></div>}
              
              <div className={`relative bg-brand-slate overflow-hidden shadow-2xl border border-slate-200 flex items-center justify-center ${isFullscreen ? 'w-full h-full rounded-none border-none' : 'aspect-video rounded-[2rem]'}`}>
                {hasError ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                    <AlertCircle className="w-12 h-12 mb-4 text-red-400" />
                    <p className="text-sm font-medium">{t.error}</p>
                  </div>
                ) : (
                  <video 
                    ref={videoRef}
                    muted 
                    loop 
                    playsInline
                    preload="auto"
                    autoPlay
                    controlsList="nodownload noremoteplayback noplaybackrate"
                    disablePictureInPicture
                    disableRemotePlayback
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={() => setHasError(true)}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onContextMenu={(e) => e.preventDefault()}
                    title="Bidflow Dubai Construction Procurement Platform Demo"
                  >
                    <source src="https://firebasestorage.googleapis.com/v0/b/bidflow-492109.firebasestorage.app/o/main-video.mp4?alt=media&token=6b9ef5be-1007-43ed-b569-d02c2da2bfd3" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}

                {/* Custom Controls Overlay */}
                {!hasError && (
                  <div className="absolute inset-0 z-20 flex flex-col justify-between p-6">
                    {/* Top area (empty) */}
                    <div></div>

                    {/* Center area (Play/Pause & Seek) */}
                    <AnimatePresence>
                      {showControls && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="flex items-center justify-center gap-4 md:gap-8"
                        >
                          <button onClick={(e) => seek(e, -5)} className="p-1.5 md:p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all">
                            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          
                          <button 
                            onClick={togglePlay} 
                            className="w-10 h-10 md:w-16 md:h-16 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full text-white shadow-xl hover:bg-black/90 hover:scale-110 transition-all duration-300 border border-white/20"
                          >
                            {isPlaying ? (
                              <Pause className="w-5 h-5 md:w-7 md:h-7 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 md:w-7 md:h-7 fill-current" />
                            )}
                          </button>

                          <button onClick={(e) => seek(e, 5)} className="p-1.5 md:p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/80 transition-all">
                            <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bottom area (Progress, Mute & Fullscreen) */}
                    <div className="flex flex-col gap-4 w-full">
                      {/* Progress Bar - Only in Fullscreen */}
                      <AnimatePresence>
                        {showControls && isFullscreen && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="w-full flex flex-col gap-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between text-[10px] md:text-xs font-black text-brand-slate mb-1">
                              <span className="px-1.5 py-0.5 bg-white/50 backdrop-blur-sm rounded">{formatTime(currentTime)}</span>
                              <span className="px-1.5 py-0.5 bg-white/50 backdrop-blur-sm rounded">{formatTime(duration)}</span>
                            </div>
                            <div className="relative w-full h-1.5 md:h-2 bg-black/10 rounded-full overflow-hidden group/progress">
                              <input 
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleProgressChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div 
                                className="absolute top-0 left-0 h-full bg-brand-primary transition-all duration-100"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center justify-between w-full">
                        <AnimatePresence>
                          {(showControls || showInitialMute) && (
                            <motion.button 
                              initial={{ opacity: 0, scale: 0.8, x: -10 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.8, x: -10 }}
                              onClick={toggleMute}
                              className="p-1 md:p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/90 hover:scale-110 transition-all duration-300 z-30 border border-white/20"
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? <VolumeX className="w-3.5 h-3.5 md:w-5 md:h-5" /> : <Volume2 className="w-3.5 h-3.5 md:w-5 md:h-5" />}
                            </motion.button>
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {showControls && (
                            <motion.button 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              onClick={toggleFullScreen}
                              className="ml-auto p-1 md:p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-black/60 transition-colors"
                              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            >
                              {isFullscreen ? <Minimize className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Maximize className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                            </motion.button>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subtle overlay for depth */}
                <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="w-full lg:w-[60%]">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black text-brand-slate mb-8 leading-tight">
                {t.headline}
              </h2>
              <p className="text-xl text-slate-500 mb-10 leading-relaxed">
                {t.description}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {t.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-brand-slate" />
                    </div>
                    <span className="text-slate-700 font-bold text-sm leading-snug">{benefit}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};