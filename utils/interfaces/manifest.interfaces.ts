export interface Manifest {
	name: string;
	created_at: string;
	medit_version: string;
	files: ManifestFile[];
}

export interface ManifestFile {
	name: string;
	absolute_path: string;
	status: "missing" | "downloaded";
	size?: number;
	last_modified?: string;
	drive_id?: string;
	drive_path?: string;
	drive_last_modified?: string;
	conflict?: boolean;
}
