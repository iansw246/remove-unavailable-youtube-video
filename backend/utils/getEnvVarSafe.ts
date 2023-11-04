export default function getEnvVarSafe(environmentVariableName: string): string {
    const value = process.env[environmentVariableName];
    if (value === undefined) {
        throw new Error(`Environment variable ${environmentVariableName} is not defined`);
    }
    return value;
}