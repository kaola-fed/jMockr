/// <reference path="ansi-escapes/index.d.ts" />

declare module "*.json" {
    const value: any
    export default value
}

declare module 'node.extend' {
    export default function(input: any, arg2: any): any
}

declare module 'connect-inject' {
    function injector(input: any): any
    export = injector
}
