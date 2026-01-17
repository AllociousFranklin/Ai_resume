declare module 'mammoth' {
    interface ExtractRawTextResult {
        value: string;
        messages: any[];
    }

    interface Options {
        buffer?: Buffer;
        path?: string;
    }

    export function extractRawText(options: Options): Promise<ExtractRawTextResult>;
    export function convertToHtml(options: Options): Promise<{ value: string; messages: any[] }>;
}
