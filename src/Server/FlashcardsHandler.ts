import { IncomingMessage, ServerResponse } from "http";
import { BaseRequestHandler } from "./BaseRequestHandler";
import { FlashcardsDBAccess } from "../Flashcard/FlashcardsDBAccess"
import { TokenValidator } from "./Model";
import { Flashcard, HTTP_CODES, HTTP_METHODS, AccessRight } from "../Shared/Model";
import { Utils } from "./Utils";

export class FlashcardsHandler extends BaseRequestHandler {
   
    private flashcardsDBAccess: FlashcardsDBAccess = new FlashcardsDBAccess()
    private tokenValidator    : TokenValidator;

    public constructor(req: IncomingMessage, res: ServerResponse, tokenValidator: TokenValidator) {
        super(req, res)
        this.tokenValidator = tokenValidator;
    }

    public async handleRequest(): Promise<void> {
        switch(this.req.method) {
            case HTTP_METHODS.OPTIONS: 
                this.res.writeHead(HTTP_CODES.OK)
                break;
            case HTTP_METHODS.GET:
                await this.handleGet();
                break;
            case HTTP_METHODS.POST:
                await this.handlePOST();
                break;
            default: 
                this.handleNotFound();
                break;

        }
    }

    private async handlePOST(){
        const operationAuthorized = await this.operationAuthorized(AccessRight.CREATE);
        if(operationAuthorized) {
            try {
                const flashcard: Flashcard = await this.getRequestBody();
                await this.flashcardsDBAccess.postFlashcard(flashcard);
                // this.respondText(HTTP_CODES.CREATED, `flashcard created`)
            } catch(error) {
                this.respondBadRequest(error.message)
            }
        }
    }

    private async handleGet() {

        const operationAuthorized = await this.operationAuthorized(AccessRight.READ);

    
        if(operationAuthorized) {
            const parsedUrl = Utils.getUrlParameters(this.req.url);
            if(parsedUrl) {
                if(parsedUrl) {

                    const cards = await this.flashcardsDBAccess.getFlashcardByUsername(parsedUrl.query.username as string);
                  
                    
                    if(cards) {
                        // console.log(cards)
                        this.respondJsonObject(HTTP_CODES.OK, cards)
                    } else {
                        this.handleNotFound()
                    }
                } 
            }
        } else {
             this.respondJsonObject(HTTP_CODES.UNAUTHORIZED, null)

        }
    }

    private async operationAuthorized(operation: AccessRight): Promise<boolean> {
        const tokenId = this.req.headers.authorization;
        if (tokenId) {
            const tokenRights = await this.tokenValidator.validateToken(tokenId);
            // console.log(`tokenRights`)
            // console.log(tokenRights)
            if (tokenRights.accessRights.includes(operation)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
}
