export const formatDateTime = (dateString) => {
    if (!dateString) return { date: "N/A", time: "N/A" };
    try {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
            time: date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
        };
    } catch {
        return { date: dateString, time: "N/A" };
    }
};