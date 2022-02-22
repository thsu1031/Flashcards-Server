import { TokenGenerator, Account, SessionToken, TokenValidator, TokenRights, TokenState, TokenGeneratorWithoutFind } from "../Server/Model";
import { SessionTokenDBAccess } from "./SessionTokenDBAccess";
import { UserCredentialsDBAccess } from "./UserCredentialsDBAccess";

export class  Authorizer implements TokenGenerator, TokenValidator, TokenGeneratorWithoutFind {
  
    private userCredDBAccess    : UserCredentialsDBAccess = new UserCredentialsDBAccess();
    private sessionTokenDBAccess: SessionTokenDBAccess    = new SessionTokenDBAccess();
    
    async generateToken(account: Account): Promise<SessionToken | undefined> {
    
        const resultAccount = await this.userCredDBAccess.getUserCredential(
            account.username, account.password
        )

        if(resultAccount) {
            const token : SessionToken = {
                accessRights   : resultAccount.accessRights,
                expirationTime : this.generateExpirationTime(),
                username       : resultAccount.username,
                valid          : true,
                tokenId        : this.generateRandomTokenId()
            };
            
            await this.sessionTokenDBAccess.storeSessionToken(token);
            return token;
        } else{
            return undefined
        }
    }

    async generateTokenWithoutFind(account: Account): Promise<SessionToken | undefined>{
        const token : SessionToken = {
            accessRights   : [0, 1, 2, 3],
            expirationTime : this.generateExpirationTime(),
            username       : account.username,
            valid          : true,
            tokenId        : this.generateRandomTokenId()
        };
        
        await this.sessionTokenDBAccess.storeSessionToken(token);
        return token;

    }

    public async validateToken(tokenId: string): Promise<TokenRights> {
        const token = await this.sessionTokenDBAccess.getToken(tokenId);
        if (!token || !token.valid) {
            return {
                accessRights: [],
                state       : TokenState.INVALID
            };
        } else if (token.expirationTime < new Date()) {
            return {
                accessRights: [],
                state       : TokenState.EXPIRED
            };
        } return {
            accessRights: token.accessRights,
            state       : TokenState.VALID
        };
    }
   
    private generateExpirationTime() {
        return new Date(Date.now() + 60 * 60 *1000);
    }

    // private generateExpirationTime() {
    //     return new Date(Date.now() + 1 * 60 *1000);
    // }

    private generateRandomTokenId() {
        return Math.random().toString(36).slice(2);
    }
}