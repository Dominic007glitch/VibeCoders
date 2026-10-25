import React,{useState} from 'react';import {X,Plus,Search,Loader2} from 'lucide-react';
export function Button({children,variant='',...props}){return <button className={'btn '+variant} {...props}>{children}</button>}
export function Modal({title,children,onClose}){return <div className="modal-back" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal"><header className="modal-top"><h2>{title}</h2><button className="icon-btn" aria-label="Fechar" onClick={onClose}><X size={21}/></button></header>{children}</section></div>}
export function Empty({label='Nada cadastrado por enquanto.'}){return <div className="empty"><span>✦</span><h3>Vamos começar?</h3><p>{label}</p></div>}
export function Spinner(){return <div className="loader"><Loader2 className="spin"/> Carregando...</div>}
export function Notice({message,type='info'}){return message?<div className={'notice '+type}>{message}</div>:null}
export function PageTitle({title,subtitle,onAdd}){return <div className="page-head"><div><h1>{title}</h1><p>{subtitle}</p></div>{onAdd&&<Button onClick={onAdd}><Plus size={17}/> Novo registro</Button>}</div>}
