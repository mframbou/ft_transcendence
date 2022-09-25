import { browser } from '$app/environment';

export function getCookie(cookie: string)
{
	if (!browser)
		return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${cookie}=`);
	if (parts && parts.length === 2)
		return parts.pop()!.split(';').shift();
}

export async function resJson(res: Response)
{
	try
	{
		return await res.json();
	}
	catch(e)
	{
		return null;
	}
}