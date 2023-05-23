package main

import (
	"strconv"
	"syscall/js"

	"github.com/cosmos/cosmos-sdk/codec"
	codectypes "github.com/cosmos/cosmos-sdk/codec/types"
	"github.com/cosmos/cosmos-sdk/crypto/keys/eth/ethsecp256k1"
	sdk "github.com/cosmos/cosmos-sdk/types"
	signingtypes "github.com/cosmos/cosmos-sdk/types/tx/signing"
	"github.com/cosmos/cosmos-sdk/x/auth/signing"
	authtx "github.com/cosmos/cosmos-sdk/x/auth/tx"
)

func TestCreateBucket() {
	key, err := ethsecp256k1.GenPrivKey()
	pubkey := key.PubKey()
	addr := sdk.AccAddress(pubkey.Address())

	interfaceRegistry := codectypes.NewInterfaceRegistry()
	marshaler := codec.NewProtoCodec(interfaceRegistry)

	txConfig := authtx.NewTxConfig(marshaler, []signingtypes.SignMode{signingtypes.SignMode_SIGN_MODE_EIP_712})
	txBuilder := txConfig.NewTxBuilder()

	chainID := "greenfield_9000-1"
	accNum, accSeq := uint64(1), uint64(2)

	signingData := signing.SignerData{
		Address:       addr.String(),
		ChainID:       chainID,
		AccountNumber: accNum,
		Sequence:      accSeq,
		PubKey:        pubkey,
	}

	//addr1 := sdk.MustAccAddressFromHex("0xa6f79b60359f141df90a0c745125b131caaffd12")
	//addr2 := sdk.MustAccAddressFromHex("0x2615e97d733115f33d1bed9ce29ac7482f1eb67d")

	//msgCreateBucket := storagetypes.NewMsgCreateBucket(
	//	addr1, "bucketName", storagetypes.VISIBILITY_TYPE_PUBLIC_READ, addr2,
	//	nil, math.MaxUint, []byte("sigbytes"), 0)

	msgSend := banktypes.NewMsgSend(addr, addr, sdk.NewCoins(sdk.NewCoin(sdk.DefaultBondDenom, sdkmath.NewInt(1))))

	err = txBuilder.SetMsgs(
		msgSend)
	// require.NoError(t, err)
	// signBytes, err := PrintTypedDataGetSignBytes(signingtypes.SignMode_SIGN_MODE_EIP_712, signingData, txBuilder.GetTx())
	// require.NoError(t, err)
	// require.NotNil(t, signBytes)
}

// this: JavaScript's this
// args: JavaScript's function params
func add(this js.Value, args []js.Value) interface{} {
	a, _ := strconv.Atoi(args[0].String())
	b, _ := strconv.Atoi(args[1].String())
	return a + b
}

func main() {
	js.Global().Set("GMESSAGE", map[string]interface{}{
		"add": js.FuncOf(add),
	})

	<-make(chan bool)
}
