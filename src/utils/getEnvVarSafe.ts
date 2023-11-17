export function getEnvVarSafe(envVarName: string): string {
    const value = process.env[envVarName];
    if (typeof value !== "string" || value.length === 0) {
        throw new Error(`Expected environment variable ${envVarName} to be a string, but was ${value}`);
    }
    return value;
}
