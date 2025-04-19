import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";
import {
    AuthZService
} from "nest-authz";
import { HttpAuthGuard, IAuthRequest } from "../authentication/http.authentication.guard";
import { number } from "zod";
import { ConfigService } from "@nestjs/config";
import { ApiResponse } from "@nestjs/swagger";
import { User } from "./users.entity";

@Controller("users")
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authzService: AuthZService,
        private readonly configService: ConfigService
    ) {}

    @Get()
    @UseGuards(HttpAuthGuard)
    @ApiResponse({
        type: [User]
    })
    async get(@Request() req: IAuthRequest, @Query("page") page: number = 1, @Query("pageSize") pageSize: number = 10): Promise<User[]> {
        console.log(req.user);
        // const en = await this.authzService.enforce(
        //     req.user?.uuid,
        //     "test",
        //     "message",
        //     "CREATE",
        // );
        // console.log("Bool:", en);
        // console.log(await this.authzService.getAllSubjects());
        // console.log(await this.authzService.getAllRoles());
        // console.log(await this.authzService.getAllObjects());
        // console.log(await this.authzService.getAllActions());
        // console.log(await this.authzService.getUsersForRole("admin", "test"));
        console.log("Page", page)
        console.log("PageSize", pageSize)
        console.log("Conf", this.configService.get<number>("API_PAGE_SIZE_LIMIT"))
        pageSize = Math.min(pageSize, this.configService.get<number>("API_PAGE_SIZE_LIMIT"))
        return await this.usersService.findPaging(page, pageSize)
    }

    @Get(":mail")
    findAll() {
        return this.usersService.findAll();
    }


    @Get(":id")
    getById(@Param("id") id: UUID) {
        return this.usersService.findOneByUuid(id);
    }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        return await this.usersService.add(dto);
    }

    @Put(":uuid")
    async update(@Param("uuid") uuid: UUID, @Body() dto: CreateUserDto) {
        return await this.usersService.update(uuid, dto);
    }
}
