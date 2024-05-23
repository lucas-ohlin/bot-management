// From pidusage documentation
declare module 'pidusage' {
	interface Stats {
		cpu: number;
		memory: number;
		ppid: number;
		pid: number;
		ctime: number;
		elapsed: number;
		timestamp: number;
	}

	function pidusage(pid: number | number[]): Promise<Stats>;
	export = pidusage;
}
