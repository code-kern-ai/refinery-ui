export function prepareSize(size: string | undefined): string {
    switch (size) {
        case "xs":
            return "h-4 w-4";
        case "sm":
            return "h-6 w-6";
        case "md":
            return "h-8 w-8 ";
        case "lg":
            return "h-10 w-10";
        case "xl":
            return "h-12 w-12";
    }
}