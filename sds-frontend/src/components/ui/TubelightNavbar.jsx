
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils.js"

export function NavBar({ items, className, isLight = true }) {
    const location = useLocation()
    const [activeTab, setActiveTab] = useState(items[0].name)
    const [isMobile, setIsMobile] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    // Reset visibility and active tab on route change
    useEffect(() => {
        setIsVisible(true)

        // Sync activeTab with current URL
        const currentItem = items.find(item => item.url === location.pathname);
        if (currentItem) {
            setActiveTab(currentItem.name);
        } else if (location.pathname === '/') {
            setActiveTab(items[0].name);
        }
    }, [location.pathname, items])

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY

                // Hide only if scrolled down more than 100px
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }
                setLastScrollY(currentScrollY)
            }
        }

        window.addEventListener('scroll', controlNavbar)
        return () => window.removeEventListener('scroll', controlNavbar)
    }, [lastScrollY])

    return (
        <div
            className={cn(
                "fixed bottom-6 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ease-in-out pointer-events-none",
                isVisible ? "translate-y-0" : "translate-y-[200%] md:-translate-y-[200%]",
                className,
            )}
        >
            <div className={cn(
                "flex items-center gap-3 border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg pointer-events-auto transition-colors duration-500 bg-white/50 dark:bg-black/50 border-black/5 dark:border-white/10"
            )}>
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeTab === item.name

                    return (
                        <Link
                            key={item.name}
                            to={item.url}
                            onClick={() => setActiveTab(item.name)}
                            className={cn(
                                "relative cursor-pointer text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
                                isActive && "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white",
                            )}
                        >
                            <span className="hidden md:inline">{item.name}</span>
                            <span className="md:hidden">
                                <Icon size={18} strokeWidth={2.5} />
                            </span>
                            {isActive && (
                                <motion.div
                                    layoutId="lamp"
                                    className="absolute inset-0 w-full rounded-full -z-10 bg-black/5 dark:bg-white/5"
                                    initial={false}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-red-600 dark:bg-white transition-colors duration-500">
                                        <div className="absolute w-12 h-6 rounded-full blur-md -top-2 -left-2 bg-red-600/20 dark:bg-white/20 transition-colors duration-500" />
                                        <div className="absolute w-8 h-6 rounded-full blur-md -top-1 bg-red-600/20 dark:bg-white/20 transition-colors duration-500" />
                                        <div className="absolute w-4 h-4 rounded-full blur-sm top-0 left-2 bg-red-600/20 dark:bg-white/20 transition-colors duration-500" />
                                    </div>
                                </motion.div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

