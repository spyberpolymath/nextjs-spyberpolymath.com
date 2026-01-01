import * as UAParser from 'ua-parser-js';

export function parseUserAgent(userAgent: string | undefined) {
	if (!userAgent) return { device: 'Unknown', browser: 'Unknown' };
	const parser = new (UAParser as any).default();
	parser.setUA(userAgent);
	const device = parser.getDevice();
	const os = parser.getOS();
	const browser = parser.getBrowser();
	let deviceStr = device.model || device.type || os.name || 'Unknown';
	if (os.name) deviceStr += ` (${os.name})`;
	return {
		device: deviceStr,
		browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown',
	};
}
