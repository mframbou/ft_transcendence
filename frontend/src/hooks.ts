import * as jwt from 'jsonwebtoken';

function getCookie(request: Request, name: string)
{
	const value = '; ' + request.headers.get('cookie');
	const parts = value.split('; ' + name + '=');
	if (parts && parts.length == 2)
		return parts.pop().split(';').shift();
}

function getPathname(url: URL)
{
	let pathname = url.pathname;
	if (pathname === '/')
		return '/';
	if (pathname.endsWith('/'))
		pathname = pathname.substring(0, pathname.length - 1);
	return pathname;
}

function getQueryParam(url: URL, param: string)
{
	const query = url.searchParams.get(param);
	if (query)
		return query;
	return null;
}

function redirectTo(url: string, code = 302)
{
	return new Response('', {status: code, headers: {'Location': url}});
}

// Will not redirect to home if user is not logged in AND redirect home if user is logged in
const loginPages = [
	'/',
	'/otp-verify'
];

const jwtSecret = process.env.JWT_SECRET;

// https://kit.svelte.dev/docs/hooks
// Redirect to login page (/) if user is not logged in (excluding excludeRedirect paths)
// Redirect to homepage (/home) if user is logged in and jwt valid
export async function handle({event, resolve})
{
	const pathname = getPathname(event.url);

	const jwtCookie = getCookie(event.request, 'cockies');
	let jwtValid = false;
	let jwtPayload = null;

	if (jwtCookie)
	{
		// check validity
		try
		{
			jwtPayload = jwt.verify(jwtCookie, jwtSecret);

			jwtValid = true;
		}
		catch (e)
		{
			console.log('jwt invalid, redirecting to homepage');
		}
	}

	// Allow user to go back to login page to change account if 2fa is required
	if (jwtPayload && jwtPayload.need2Fa)
	{
		jwtValid = false;
		if (!loginPages.includes(pathname))
			return redirectTo('/otp-verify');
	}

	// if not logged in, redirect to login
	if (!jwtValid && !loginPages.includes(pathname))
		return redirectTo('/');

	// if logged in and on login page, redirect to home
	if (jwtValid && loginPages.includes(pathname))
		return redirectTo('/home');


	return await resolve(event);
}