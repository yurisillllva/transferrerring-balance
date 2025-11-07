import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
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
  constructor(private readonly service: WalletService) {}

  /**
   * Somente o gerente: transfere do saldo do gerente para outro usuário
   */
  @Post('transfer')
  @ApiOkResponse({ description: 'Transferência realizada (somente gerente)' })
  async transfer(@Req() req: any, @Body() dto: TransferDto) {
    const tx = await this.service.transfer(req.user.userId, dto.toUserId, dto.amount);
    return tx;
  }

  /**
   * Somente o gerente: retira saldo de um usuário para o saldo do gerente
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
    const tx = await this.service.reverse(req.user.userId, dto.transactionId);
    return tx;
  }

  @Get('transactions/:userId')
  @ApiOkResponse({ description: 'Últimas transações do usuário' })
  async list(@Param('userId') userId: string) {
    return this.service.listByUser(userId);
  }
}
