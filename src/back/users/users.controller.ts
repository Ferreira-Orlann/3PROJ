import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    SerializeOptions,
    UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UUID } from "crypto";
import {
    HttpAuthGuard,
    IAuthRequest,
} from "../authentication/http.authentication.guard";
import { ConfigService } from "@nestjs/config";
import { ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { User, BasicUser, CreateUserDto } from "./users.entity";
import { plainToInstance } from "class-transformer";

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) {}

    @Get()
    @ApiResponse({
        type: BasicUser,
    })
    @ApiQuery({
        name: "page",
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: "pageSize",
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: "basic",
        required: false,
        type: Boolean,
    })
    async getBasic(
        @Request() req: IAuthRequest,
        @Query("page") page: number = 1,
        @Query("pageSize") pageSize: number = 10,
        @Query("basic") basic: boolean = false,
    ): Promise<User[] | BasicUser[]> {
        if (basic) {
            pageSize = Math.min(
                pageSize,
                this.configService.get<number>("API_PAGE_SIZE_LIMIT"),
            );
            const pageData = await this.usersService.findPaging(page, pageSize);
            const transformed = pageData.map((val) =>
                plainToInstance(BasicUser, val, {
                    strategy: "excludeAll",
                    excludeExtraneousValues: true,
                }),
            );
            return transformed;
        } else {
            pageSize = Math.min(
                pageSize,
                this.configService.get<number>("API_PAGE_SIZE_LIMIT"),
            );
            const pageData = await this.usersService.findPaging(page, pageSize);
            return pageData;
        }
    }

    @Get("all")
    findAll() {
        return this.usersService.findAll();
    }

    @Get(":email")
    findOneByEmail(@Param("email") email: string) {
        return this.usersService.findOneByEmail(email);
    }

    @Get("uuid/:uuid")
    @ApiParam({
        name: "uuid",
        required: true,
        type: String,
        description: "User UUID",
    })
    @ApiResponse({
        type: User,
    })
    async getById(@Param("uuid") uuid: UUID) {
        console.log("Recherche de l'utilisateur avec UUID:", uuid);
        const user = await this.usersService.findOneByUuid(uuid);
        if (!user) {
            console.log("Aucun utilisateur trouvé avec UUID:", uuid);
            return null;
        }
        console.log("Utilisateur trouvé:", user.username);
        return user;
    }

    @Post()
    @SerializeOptions({ type: User })
    create(@Body() dto: CreateUserDto): Promise<User> {
        return this.usersService.add(dto);
    }

    @Put(":uuid")
    @SerializeOptions({ type: User })
    async update(@Param("uuid") uuid: UUID, @Body() dto: CreateUserDto) {
        return await this.usersService.update(uuid, dto);
    }
}
