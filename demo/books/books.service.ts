import { NotFoundException, Injectable } from '../../core';
import type { CreateBookDto, UpdateBookDto } from './dto/create-book.dto';

export interface Book {
  id: number;
  title: string;
  author?: string;
  year?: number;
  createdAt: Date;
}

@Injectable()
export class BooksService {
  private books: Book[] = [
    { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, createdAt: new Date() },
    { id: 2, title: '1984', author: 'George Orwell', year: 1949, createdAt: new Date() },
    { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960, createdAt: new Date() },
  ];

  private nextId = 4;

  findAll(): Book[] {
    console.log('[BooksService] Finding all books');
    return this.books;
  }

  findOne(id: number): Book {
    console.log(`[BooksService] Finding book with id: ${id}`);
    const book = this.books.find((b) => b.id === id);

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  create(dto: CreateBookDto): Book {
    console.log(`[BooksService] Creating book: ${dto.title}`);

    const book: Book = {
      id: this.nextId++,
      title: dto.title,
      author: dto.author,
      year: dto.year,
      createdAt: new Date(),
    };

    this.books.push(book);
    return book;
  }

  update(id: number, dto: UpdateBookDto): Book {
    console.log(`[BooksService] Updating book with id: ${id}`);

    const index = this.books.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    const book = this.books[index];
    this.books[index] = { ...book, ...dto };

    return this.books[index];
  }

  remove(id: number): { deleted: boolean; id: number } {
    console.log(`[BooksService] Deleting book with id: ${id}`);

    const index = this.books.findIndex((b) => b.id === id);

    if (index === -1) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    this.books.splice(index, 1);
    return { deleted: true, id };
  }
}
