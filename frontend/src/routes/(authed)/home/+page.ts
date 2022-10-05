export async function load({ url })
{
	// check if queryParam duelId= exists
	const duelId = url.searchParams.get('duel_id');

	if (duelId)
	{
		return {
			duelId: duelId,
		};
	}
}