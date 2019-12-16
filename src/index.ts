type TransporterOptions = {
    host: string,
    port: string,
    protocol?: string
}

class WinstonGelfTransporter {
    private options: TransporterOptions;
    constructor(options: TransporterOptions) {
        this.options = options;
    }
}

export default WinstonGelfTransporter;