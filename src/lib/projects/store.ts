import fs from "fs";
import path from "path";
import { Project, ProjectMeta } from "./types";

const DATA_DIR = path.join(process.env.HOME || "", "SonicStudio", "data", "projects");

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class ProjectStore {
    static getPath(id: string): string {
        return path.join(DATA_DIR, `${id}.json`);
    }

    static list(): ProjectMeta[] {
        if (!fs.existsSync(DATA_DIR)) return [];

        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
        const projects: ProjectMeta[] = [];

        for (const file of files) {
            try {
                const data = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
                const json = JSON.parse(data);
                // Extract only metadata to keep list lightweight
                projects.push({
                    id: json.id,
                    name: json.name,
                    created: json.created,
                    modified: json.modified,
                    author: json.author,
                    version: json.version
                });
            } catch (e) {
                console.warn(`Failed to parse project: ${file}`);
            }
        }

        // Sort by modified desc
        return projects.sort((a, b) => b.modified - a.modified);
    }

    static save(project: Project): void {
        const filePath = this.getPath(project.id);
        const data = JSON.stringify(project, null, 2);
        fs.writeFileSync(filePath, data);
    }

    static load(id: string): Project | null {
        const filePath = this.getPath(id);
        if (!fs.existsSync(filePath)) return null;

        try {
            const data = fs.readFileSync(filePath, "utf-8");
            return JSON.parse(data) as Project;
        } catch (e) {
            console.error(`Error loading project ${id}`, e);
            return null;
        }
    }

    static delete(id: string): void {
        const filePath = this.getPath(id);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
}
