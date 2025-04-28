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
import { CreateUserDto } from "./users.dto";
import { UUID } from "crypto";
import {
    HttpAuthGuard,
    IAuthRequest,
} from "../authentication/http.authentication.guard";
import { ConfigService } from "@nestjs/config";
import { ApiParam, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { User, BasicUser } from "./users.entity";
import { data } from "react-router-dom";
import { plainToInstance } from "class-transformer";
import { Validate } from "class-validator";

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
        console.log("Get Users");
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

    @Get(":id")
    getById(@Param("id") id: UUID): Promise<User> {
        return this.usersService.findOneByUuid(id);
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
