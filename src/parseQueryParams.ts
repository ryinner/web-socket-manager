export default function (queryParams?: Record<string, string>): string {
    if (typeof queryParams !== 'object') {
        return '';
    }
    return `?${new URLSearchParams(queryParams).toString()}`;
}
