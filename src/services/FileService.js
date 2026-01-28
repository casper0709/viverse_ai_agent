import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger.js';

class FileService {
    constructor() {
        // Base directory for allowed file operations
        this.baseDir = process.env.VIVERSE_PROJECTS_DIR || '/Users/casper_wang/Projects/AI';
    }

    /**
     * Resolve and validate path is within baseDir
     */
    resolvePath(targetPath) {
        let absolutePath;
        if (path.isAbsolute(targetPath)) {
            absolutePath = targetPath;
        } else {
            absolutePath = path.resolve(this.baseDir, targetPath);
        }

        if (!absolutePath.startsWith(this.baseDir)) {
            throw new Error(`Access denied: Path ${targetPath} is outside of allowed directory ${this.baseDir}`);
        }
        return absolutePath;
    }

    async readFile(filePath) {
        try {
            const resolvedPath = this.resolvePath(filePath);
            const content = await fs.readFile(resolvedPath, 'utf8');
            return content;
        } catch (error) {
            logger.error(`FileService.readFile Error: ${error.message}`);
            throw error;
        }
    }

    async listFiles(dirPath = '.') {
        try {
            const resolvedPath = this.resolvePath(dirPath);
            const files = await fs.readdir(resolvedPath, { withFileTypes: true });
            return files.map(f => ({
                name: f.name,
                isDirectory: f.isDirectory(),
                path: path.join(dirPath, f.name)
            }));
        } catch (error) {
            logger.error(`FileService.listFiles Error: ${error.message}`);
            throw error;
        }
    }

    async writeFile(filePath, content) {
        try {
            const resolvedPath = this.resolvePath(filePath);
            await fs.mkdir(path.dirname(resolvedPath), { recursive: true });
            await fs.writeFile(resolvedPath, content, 'utf8');
            return { success: true, path: filePath };
        } catch (error) {
            logger.error(`FileService.writeFile Error: ${error.message}`);
            throw error;
        }
    }

    async runCommand(command, cwd) {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        try {
            const workingDir = cwd ? this.resolvePath(cwd) : this.baseDir;
            logger.info(`Running command: ${command} in ${workingDir}`);
            const { stdout, stderr } = await execAsync(command, { cwd: workingDir });

            if (!stdout && !stderr) {
                return { result: "Command executed successfully but produced no output." };
            }

            return { stdout: stdout || "", stderr: stderr || "" };
        } catch (error) {
            logger.error(`FileService.runCommand Error: ${error.message}`);
            return {
                error: error.message,
                stdout: error.stdout || "",
                stderr: error.stderr || ""
            };
        }
    }
}

export default new FileService();
