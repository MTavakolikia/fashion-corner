"use client"

import { useEffect } from "react"

export function BodyCleanup() {
    useEffect(() => {
        document.body.removeAttribute("cz-shortcut-listen")
    }, [])

    return null
}
