// Transcendence
import { ISession } from '../interfaces/interfaces';

export default abstract class AbstractSessionStorage {
  abstract find_session(id: string): Promise<ISession>;

  abstract save_current_session(id: string, session: ISession);

  abstract find_every_sessions(): Promise<Map<string, ISession>>;
}
