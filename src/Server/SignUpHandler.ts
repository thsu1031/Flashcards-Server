import { IncomingMessage, ServerResponse } from "http";
import { HTTP_CODES, HTTP_METHODS } from "../Shared/Model";
import { BaseRequestHandler } from "./BaseRequestHandler";
import { Account, TokenGeneratorWithoutFind } from "./Model";
import { UserCredentialsDBAccess } from "../Authorization/UserCredentialsDBAccess"
import bcrypt = require("bcrypt");

export class SignUpHandler extends BaseRequestHandler {
    private tokenGenerator: TokenGeneratorWithoutFind;
    private userCredentialsDBAccess: UserCredentialsDBAccess = new UserCredentialsDBAccess();
    
    public constructor (req: IncomingMessage, res: ServerResponse, tokenGenerator: TokenGeneratorWithoutFind) {
        super(req, res) 
        this.tokenGenerator = tokenGenerator;
    }

    public async handleRequest(): Promise<void> {
        switch(this.req.method) {
            case HTTP_METHODS.PUT:
                await this.handlePut();
                break;
            case HTTP_METHODS.OPTIONS: 
                this.res.writeHead(HTTP_CODES.OK)
                break;
            default: 
                this.handleNotFound();
                break;
        }
    }

    private async handlePut(): Promise<void> {
        try {
            const body: Account = await this.getRequestBody();

            if(body.password) {
                const hashedPassword = await this.hashPassword(body.password);
                const createUser = await this.userCredentialsDBAccess.putUserCredential(
                    { username    : body.username, 
                      password    : hashedPassword, 
                      accessRights: [0, 1, 2, 3],
                   });
            }

           
            const sessionToken = await this.tokenGenerator.generateTokenWithoutFind(body);

            if(sessionToken) {
                this.res.statusCode = HTTP_CODES.CREATED;
                this.res.writeHead(HTTP_CODES.CREATED,  {'Content-Type': 'application/json'})
                this.res.write(JSON.stringify(sessionToken))
            } else {
               this.res.statusCode = HTTP_CODES.NOT_FOUND;
               this.res.write('wrong username or password');
            }

        } catch (error) {
            this.res.write('error ' + error.message)
        }
    }

    private async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 12)
    }  
}