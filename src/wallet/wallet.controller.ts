import { Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { TransferDto } from './dto/transfer.dto';
import { ReversalDto } from './dto/reversal.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('wallet')
export class WalletController {
  constructor(private readonly service: WalletService) { }

  /**
   * Somente o gerente: transfere de A -> B
   */
  @Post('transfer')
  @ApiOkResponse({ description: 'Transferência realizada (somente gerente)' })
  async transfer(@Req() req: any, @Body() dto: TransferDto) {
    const tx = await this.service.transfer(req.user.userId, dto.fromUserId, dto.toUserId, dto.amount);
    return tx;
  }

  /**
   * Somente o gerente: retira saldo de X -> gerente (atalho)
   */
  @Post('withdraw')
  @ApiOkResponse({ description: 'Retirada realizada (somente gerente)' })
  async withdraw(@Req() req: any, @Body() dto: WithdrawDto) {
    const tx = await this.service.withdraw(req.user.userId, dto.fromUserId, dto.amount);
    return tx;
  }

  /**
   * Somente o gerente: reverte uma transferência
   */
  @Post('reverse')
  @ApiOkResponse({ description: 'Reversão realizada (somente gerente)' })
  async reverse(@Req() req: any, @Body() dto: ReversalDto) {
    return this.service.reverse(req.user.userId, Number(dto.transactionId));
  }

  @Get('transactions/:userId')
  @ApiOkResponse({ description: 'Últimas transações do usuário' })
  async list(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.listByUser(userId);
  }
}
