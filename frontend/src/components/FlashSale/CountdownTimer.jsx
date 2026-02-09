import { useState, useEffect } from 'react'
import './FlashSale.css'

const CountdownTimer = ({ endTime, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

    function calculateTimeLeft() {
        const difference = new Date(endTime) - new Date()

        if (difference <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            expired: false
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft()
            setTimeLeft(newTimeLeft)

            if (newTimeLeft.expired && onExpire) {
                onExpire()
                clearInterval(timer)
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [endTime, onExpire])

    const isUrgent = !timeLeft.expired && timeLeft.days === 0 && timeLeft.hours < 1

    if (timeLeft.expired) {
        return (
            <div className="countdown-timer expired">
                <span className="countdown-label">Sale Ended</span>
            </div>
        )
    }

    return (
        <div className={`countdown-timer ${isUrgent ? 'urgent' : ''}`}>
            <span className="countdown-label">Ends in</span>
            <div className="countdown-units">
                {timeLeft.days > 0 && (
                    <div className="countdown-unit">
                        <span className="countdown-value">{String(timeLeft.days).padStart(2, '0')}</span>
                        <span className="countdown-text">Days</span>
                    </div>
                )}
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.hours).padStart(2, '0')}</span>
                    <span className="countdown-text">Hrs</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
                    <span className="countdown-text">Min</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-unit">
                    <span className="countdown-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
                    <span className="countdown-text">Sec</span>
                </div>
            </div>
        </div>
    )
}

export default CountdownTimer
