import * as React from "react"
import { cn } from "../../lib/utils"

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    src?: string
    alt?: string
    fallback?: string
    size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg"
}

export function Avatar({
    src,
    alt = "User avatar",
    fallback = "U",
    size = "md",
    className,
    ...props
}: AvatarProps) {
    const [imageError, setImageError] = React.useState(false)

    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <div
            className={cn(
                "relative inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-medium overflow-hidden",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt}
                    className="h-full w-full object-cover"
                    onError={handleImageError}
                />
            ) : (
                <span className="select-none">
                    {fallback.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    )
}
