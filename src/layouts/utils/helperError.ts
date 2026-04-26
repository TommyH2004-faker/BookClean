export const getErrorMessage = async (res: Response) => {
    const text = await res.text();

    try {
        const json = JSON.parse(text);
        return json.message || text;
    } catch {
        return text; // nếu BE trả string thuần
    }
};