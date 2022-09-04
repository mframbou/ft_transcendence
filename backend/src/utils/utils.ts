export function getCookie(target: string, cookies: string)
{
	let value = "; " + cookies;
	let parts = value.split("; " + target + "=");
	if (parts.length == 2)
		return parts.pop().split(";").shift();
}
