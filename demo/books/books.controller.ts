import { UseInterceptors, UsePipes, UseGuards, Param, Body, Get, Post, Put, Delete, Controller } from '../../core';
import { BooksService } from './books.service';
import { createBookSchema, updateBookSchema, CreateBookDto, UpdateBookDto } from './dto/create-book.dto';
import { RolesGuard, Roles } from '../common/guards/roles.guard';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { LoggingInterceptor } from '../common/interceptors/logging.interceptor';

@Controller('/books')
@UseGuards(RolesGuard)
@UseInterceptors(LoggingInterceptor)
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('/')
  @Roles('admin', 'user')
  findAll() {
    console.log('[BooksController] Handler: findAll');
    return this.booksService.findAll();
  }

  @Get('/:id')
  @Roles('admin', 'user')
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(`[BooksController] Handler: findOne(${id})`);
    return this.booksService.findOne(id);
  }

  @Post('/')
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(createBookSchema))
  create(@Body() dto: CreateBookDto) {
    console.log('[BooksController] Handler: create');
    return this.booksService.create(dto);
  }

  @Put('/:id')
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(updateBookSchema))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookDto
  ) {
    console.log(`[BooksController] Handler: update(${id})`);
    return this.booksService.update(id, dto);
  }

  @Delete('/:id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    console.log(`[BooksController] Handler: remove(${id})`);
    return this.booksService.remove(id);
  }
}
